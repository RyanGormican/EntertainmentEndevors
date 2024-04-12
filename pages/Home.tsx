import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button  } from '@mui/material';

import Header from '../app/Header';
import styles from '../app/page.module.css';

export default function Home() {
  const [episodes, setEpisodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const response = await fetch('https://api.tvmaze.com/schedule/full');
        if (!response.ok) {
          throw new Error('Failed to fetch episodes');
        }
        const data = await response.json();
        console.log(data);
          const currentTimestamp = new Date().getTime();
        const filteredEpisodes = data.filter(episode => {
          const episodeTimestamp = new Date(episode.airstamp).getTime();
          return episodeTimestamp > currentTimestamp;
        });
       
        // Calculate the total number of pages
        const totalPages = Math.ceil(filteredEpisodes.length / 120);
        setTotalPages(totalPages);
        
        // Limit the episodes to display based on the current page
        limitView(data);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    }
    fetchEpisodes();
  }, [page]);

  // Function to limit episodes to display based on the current page
  function limitView(data) {
    // Get the current timestamp
    const currentTimestamp = new Date().getTime();

    // Filter episodes that have not aired yet
    const filteredEpisodes = data.filter(episode => {
      const episodeTimestamp = new Date(episode.airstamp).getTime();
      return episodeTimestamp > currentTimestamp;
    });

    // Slice the filtered episodes based on the current page
    const limitedEpisodes = filteredEpisodes.slice((page - 1) * 120, page * 120);
    
    // Set the episodes to state
    setEpisodes(limitedEpisodes);
  }
  // Function to format the timestamp to a more user-friendly format
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(); // You can use other formatting methods if needed
  }
    // Function to handle pagination button click
  function handlePageClick(newPage) {
    setPage(newPage);
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

      </div>
      <Grid container spacing={2} className={styles.gridContainer}>
        {episodes.map(episode => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={episode.id}>
            <Card>
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
