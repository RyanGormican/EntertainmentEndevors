import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import './globals.css';
import styles from './page.module.css';

interface Episode {
  id: number;
  _embedded: {
    show: {
      type: string;
      language: string;
      name: string;
      image: {
        medium: string;
      };
    };
  };
  airstamp: string;
  season: number;
  number: number;
  name: string;
}

const Episode: React.FC<{ episodes: Episode[] }> = ({ episodes }) => {
  // Format timestamp to a user-friendly format
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <Grid container spacing={2} className={styles.gridContainer}>
      {episodes.map((episode) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={episode.id}>
          <Card style={{ height: episode._embedded.show.image?.medium ? '100%' : '273.33px' }}>
            {episode._embedded.show.image?.medium && (
              <CardMedia
                component="img"
                height="80vh"
                image={episode._embedded.show.image.medium}
                alt={episode._embedded.show.name}
              />
            )}
            <CardContent>
              <Typography variant="h5" component="h2" className="Typography">
                {episode._embedded.show.name}
              </Typography>
              <Typography color="textSecondary" className="Typography">
                Airing: {formatTimestamp(episode.airstamp)}
              </Typography>
              <Typography color="textSecondary" className="Typography">
                Season {episode.season} Episode {episode.number}
              </Typography>
              <Typography variant="body2" component="p" className="Typography">
                {episode.name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Episode;
