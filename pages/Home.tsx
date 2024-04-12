import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';

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
        
        // Calculate the total number of pages
        const totalPages = Math.ceil(data.length / 120);
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
                <Typography variant="h5" component="h2">
                  {episode._embedded.show.name}
                </Typography>
                <Typography color="textSecondary">
                  Airing: {formatTimestamp(episode.airstamp)}
                </Typography>
                <Typography color="textSecondary">
                  Season {episode.season} Episode {episode.number}
                </Typography>
                <Typography variant="body2" component="p">
                  {episode.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div className="page">
        Page: {page} / {totalPages}
      </div>
    </main>
  );
}
