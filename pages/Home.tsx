import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, MenuItem, Popover } from '@mui/material';

import Header from '../app/Header';
import styles from '../app/page.module.css';
import { Icon } from '@iconify/react';
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

interface Filters {
  [key: string]: boolean;
}

export default function Home() {
  const [totalEpisodes, setTotalEpisodes] = useState<Episode[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [length, setLength] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({});
  const [sortOption, setSortOption] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch episodes from API on component mount
  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const response = await fetch('https://api.tvmaze.com/schedule/full');
        if (!response.ok) {
          throw new Error('Failed to fetch episodes');
        }
        const data: Episode[] = await response.json();
        const currentTimestamp = new Date().getTime();
        const newEpisodes = data.filter(episode => {
          const episodeTimestamp = new Date(episode.airstamp).getTime();
          return episodeTimestamp > currentTimestamp;
        });
        setTotalEpisodes(newEpisodes);

        const filteredEpisodes = applyFilters(newEpisodes);
        limitView(filteredEpisodes);

        const uniqueTypes = Array.from(new Set(newEpisodes.map(episode => episode._embedded.show.type)));
        const initialFilters = uniqueTypes.reduce((acc, type) => {
          acc[type] = true;
          return acc;
        }, {} as Filters);
        setFilters(initialFilters);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    }
    fetchEpisodes();
  }, []);

  // Update episodes when page, filters, sort option, or sort direction change
  useEffect(() => {
    const filteredEpisodes = applyFilters(totalEpisodes);
    const sortedEpisodes = sortEpisodes(filteredEpisodes);
    setLength(sortedEpisodes.length);
    limitView(sortedEpisodes);
  }, [page, filters, sortOption, sortDirection]);

  // Function to limit episodes displayed based on current page
  function limitView(data: Episode[]) {
    const limitedEpisodes = data.slice((page - 1) * 120, page * 120);
    setEpisodes(limitedEpisodes);
  }

  // Format timestamp to a user-friendly format
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  // Handle pagination button click
  function handlePageClick(newPage: number) {
    setPage(newPage);
  }

  // Handle filter change
  function handleFilterChange(key: keyof Filters, value: boolean) {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  }

  // Apply filters to episodes data
  function applyFilters(data: Episode[]) {
    let filteredData = data;

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) {
        filteredData = filteredData.filter(episode => episode._embedded.show.type !== key);
      }
    });

    filterPages(filteredData);

    return filteredData;
  }

  // Calculate total pages based on filtered data
  function filterPages(data: Episode[]) {
    const totalPages = Math.ceil(data.length / 120);
    setTotalPages(totalPages);
  }

  // Sort episodes based on selected option and direction
  function sortEpisodes(data: Episode[]) {
    switch (sortOption) {
      case 'date':
        return data.sort((a, b) => {
          const timestampA = new Date(a.airstamp).getTime();
          const timestampB = new Date(b.airstamp).getTime();
          return sortDirection === 'asc' ? timestampA - timestampB : timestampB - timestampA;
        });
      case 'episodeName':
        return data.sort((a, b) => sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      case 'showName':
        return data.sort((a, b) => sortDirection === 'asc' ? a._embedded.show.name.localeCompare(b._embedded.show.name) : b._embedded.show.name.localeCompare(a._embedded.show.name));
      default:
        return data;
    }
  }

  // Handle sort option change
  function handleSortOptionChange(option: string) {
    setSortOption(option);
  }

  // Handle sort direction change
  function handleSortDirectionChange(direction: 'asc' | 'desc') {
    setSortDirection(direction);
  }

  // Toggle all filters to selected value
  function toggleAllFilters(value: boolean) {
    const updatedFilters: Filters = {};
    for (const key in filters) {
      updatedFilters[key] = value;
    }
    setFilters(updatedFilters);
  }

  // Open popover menu for filters
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Close popover menu for filters
  const handleClose = () => {
    setAnchorEl(null);
  };

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
        {/* Filter button */}
        <Button style={{ color: 'white' }} onClick={handleClick}>
          Filters
        </Button>
        {/* Popover menu for filters */}
        <Popover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem>
            <div>Types</div>
          </MenuItem>
          <MenuItem>
            {/* Buttons to select/deselect all filters */}
            <Button onClick={() => toggleAllFilters(true)}>Select All</Button>
            <Button onClick={() => toggleAllFilters(false)}>Deselect All</Button>
          </MenuItem>
          {/* Filter checkboxes */}
          {Object.entries(filters)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => (
              <MenuItem key={key}>
                {key}
                <input type="checkbox" checked={value} onChange={() => handleFilterChange(key, !value)} />
              </MenuItem>
            ))}
        </Popover>
        {/* Dropdown menu for sorting options */}
        <select value={sortOption} onChange={(e) => handleSortOptionChange(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="episodeName">Sort by Episode Name</option>
          <option value="showName">Sort by Show Name</option>
        </select>
        {/* Button to toggle sort direction */}
        <Button onClick={() => handleSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}>
          {/* Icon indicating sort direction */}
          {sortDirection === 'asc' ? <Icon icon="mdi:sort-ascending" color="#e8eaea" width="60" /> : <Icon icon="mdi:sort-descending" color="#e8eaea" width="60" />}
        </Button>
      </div>
      {/* Grid container for displaying episodes */}
      <Grid container spacing={2} className={styles.gridContainer}>
        {episodes.map(episode => (
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
      {/* Display total number of entries */}
      <div className="text">{length} Entries</div>
      {/* Pagination buttons */}
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
