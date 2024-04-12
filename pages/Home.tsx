import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';

import Header from '../app/Header';
import styles from '../app/page.module.css';

export default function Home() {
  const [episodes, setEpisodes] = useState([]);
  
  useEffect(() => {
    async function fetchEpisodes() {
      try {
        // Get the user's current timestamp
        const currentTimestamp = new Date().getTime();
        
        // Calculate the timestamp for one month ahead of the current timestamp
        const oneMonthAheadTimestamp = new Date(currentTimestamp);
        oneMonthAheadTimestamp.setMonth(oneMonthAheadTimestamp.getMonth() + 1);
        const oneMonthAhead = oneMonthAheadTimestamp.getTime();

        const response = await fetch('https://api.tvmaze.com/schedule/full');
        if (!response.ok) {
          throw new Error('Failed to fetch episodes');
        }
        const data = await response.json();
        
        // Filter episodes based on the user's timestamp and cutoff one month ahead
        const filteredEpisodes = data.filter(episode => {
          // Convert the episode's timestamp to a Date object
          const episodeTimestamp = new Date(episode.airstamp).getTime();
          // Compare the episode's timestamp with the user's timestamp and cutoff one month ahead
          return episodeTimestamp > currentTimestamp && episodeTimestamp < oneMonthAhead;
        });

        setEpisodes(filteredEpisodes);
        console.log(episodes);//
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    }
    fetchEpisodes();
  }, []);

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
                <CardMedia
                  component="img"
                  height="140"
                  image={episode._embedded.show.image?.medium}
                  alt={episode._embedded.show.name}
                />
        
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
    </main>
  );
}
