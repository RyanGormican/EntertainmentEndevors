import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, MenuItem, Menu } from '@mui/material';

import Header from '../app/Header';
import styles from '../app/page.module.css';

export default function Home() {
  const [totalEpisodes, setTotalEpisodes] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    talkShow: true,
    news:true,
    nonEnglish:true,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const response = await fetch('https://api.tvmaze.com/schedule/full');
        if (!response.ok) {
          throw new Error('Failed to fetch episodes');
        }
        const data = await response.json();
            const currentTimestamp = new Date().getTime();
          const newEpisodes = data.filter(episode => {
          const episodeTimestamp = new Date(episode.airstamp).getTime();
          return episodeTimestamp > currentTimestamp;
        });
        setTotalEpisodes(newEpisodes);
        // Filter episodes based on the current filters
        const filteredEpisodes = applyFilters(newEpisodes);
        
  
        // Limit the episodes to display based on the current page
        limitView(filteredEpisodes);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    }
    fetchEpisodes();
  }, []);

  useEffect(() => {
    // Filter episodes based on the current filters
        const filteredEpisodes = applyFilters(totalEpisodes);
        // Limit the episodes to display based on the current page
        limitView(filteredEpisodes);
        console.log(episodes);
  }, [page,filters]);

  // Function to limit episodes to display based on the current page
  function limitView(data) {
    // Slice the filtered episodes based on the current page
    const limitedEpisodes = data.slice((page - 1) * 120, page * 120);
    
    // Set the episodes to state
    setEpisodes(limitedEpisodes);
  }

  // Function to format the timestamp to a more user-friendly format
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  }

  // Function to handle pagination button click
  function handlePageClick(newPage) {
    setPage(newPage);
  }

// Function to handle filter change
function handleFilterChange(key, value) {
  setFilters(prevFilters => ({
    ...prevFilters,
    [key]: value,
  }));
}


  // Function to apply filters to episodes data
 function applyFilters(data) {
  let filteredData = data;
  if (!filters.talkShow) {
    filteredData = filteredData.filter(episode => episode._embedded.show.type !== 'Talk Show');
  }
  if (!filters.news) {
    filteredData = filteredData.filter(episode => episode._embedded.show.type !== 'News');
  }
   if (!filters.nonEnglish) {
    filteredData = filteredData.filter(episode => episode._embedded.show.language === 'English');
  }
  filterPages(filteredData);
  return filteredData;
}

      // Calculate the total number of pages
  function filterPages(data) {
    const totalPages = Math.ceil(data.length / 120);
    setTotalPages(totalPages);
  }
  // Generate dynamic pagination buttons
  const paginationButtons = [];
  const maxButtonsToShow = 5; // Maximum number of pagination buttons to show
  const startPage = Math.max(1, page - Math.floor(maxButtonsToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
  for (let i = startPage; i <= endPage; i++) {
    paginationButtons.push(
      <Button
        key={i}
        variant={page === i ? "contained" : "outlined"}
        onClick={() => handlePageClick(i)}
        style={{ backgroundColor: page === i ? '#6e366e' : 'white', color: page === i ? 'white' : 'black' }}
      >
        {i}
      </Button>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className="operations">
     <Button style={{color:'white'}} onClick={()=>setAnchorEl(!anchorEl)}> Filters </Button>
   <Menu
  anchorEl={null}
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'left',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'left',
  }}
>
  {Object.entries(filters).map(([key, value]) => (
    <MenuItem key={key}>
      {key}
       <input type="checkbox" checked={value} onChange={() => handleFilterChange(key, !value)} />
    </MenuItem>
  ))}
</Menu>





      </div>
<Grid container spacing={2} className={styles.gridContainer}>
  {episodes.map(episode => (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={episode.id}>
      <Card style={{ height: episode._embedded.show.image?.medium ? '100%' : '273.33px' }}>
        {episode._embedded.show.image?.medium && 
          <CardMedia
            component="img"
            height="80vh"  
            image={episode._embedded.show.image.medium}
            alt={episode._embedded.show.name}
          />
        }
        <CardContent>
          <Typography variant="h5" component="h2" className="Typography">
            {episode._embedded.show.name}
          </Typography>
          <Typography color="textSecondary"  className="Typography">
            Airing: {formatTimestamp(episode.airstamp)}
          </Typography>
          <Typography color="textSecondary"  className="Typography">
            Season {episode.season} Episode {episode.number}
          </Typography>
          <Typography variant="body2" component="p"  className="Typography">
            {episode.name}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>


      <div className="pagination">
        {startPage !== 1 && (
          <Button
            key="first"
            variant="outlined"
            onClick={() => handlePageClick(1)}
            style={{ backgroundColor: page === 1 ? '#6e366e' : 'white', color: page === 1 ? 'white' : 'black' }}
          >
            1
          </Button>
        )}
        {startPage > 2 && <span>...</span>}
        {paginationButtons}
        {endPage < totalPages - 1 && <span>...</span>}
        {endPage !== totalPages && (
          <Button
            key="last"
            variant="outlined"
            onClick={() => handlePageClick(totalPages)}
            style={{ backgroundColor: page === totalPages ? '#6e366e' : 'white', color: page === totalPages ? 'white' : 'black' }}
          >
            {totalPages}
          </Button>
        )}
      </div>
    </main>
  );
}
