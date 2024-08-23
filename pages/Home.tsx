import { useState, useEffect } from 'react';
import { Button, Menu, MenuItem, Popover } from '@mui/material';

import Header from '../app/Header';
import styles from '../app/page.module.css';
import { Icon } from '@iconify/react';
import Episode,{EpisodeData} from '../app/Episode';


interface Filters {
  [key: string]: {
    value: boolean;
    tag: string;
  };
}

export default function Home() {
  const [totalEpisodes, setTotalEpisodes] = useState<EpisodeData[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [length, setLength] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({});
  const [sortOption, setSortOption] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [typesAnchorEl, setTypesAnchorEl] = useState<null | HTMLElement>(null);
  const [languagesAnchorEl, setLanguagesAnchorEl] = useState<null | HTMLElement>(null);
  const [networksAnchorE1, setNetworksAnchorEl] = useState<null | HTMLElement>(null);
  const [streamingServiceAnchorE1, setStreamingServiceAnchorE1] = useState<null | HTMLElement>(null);
  // Fetch episodes from API on component mount


  // Update episodes when page, filters, sort option, or sort direction change
  useEffect(() => {
    const filteredEpisodes = applyFilters(totalEpisodes);
    const sortedEpisodes = sortEpisodes(filteredEpisodes);
    setLength(sortedEpisodes.length);
    limitView(sortedEpisodes);
  }, [page, filters, sortOption, sortDirection]);

  // Function to limit episodes displayed based on current page
  function limitView(data: EpisodeData[]) {
    const limitedEpisodes = data.slice((page - 1) * 120, page * 120);
    setEpisodes(limitedEpisodes);
  }


  // Handle pagination button click
  function handlePageClick(newPage: number) {
    setPage(newPage);
  }

  // Handle filter change
function handleFilterChange(key: keyof Filters, value: boolean) {
  setFilters(prevFilters => {
    return {
      ...prevFilters,
      [key]: {
        ...prevFilters[key], 
        value: value, 
      },
    };
  });
}


function applyFilters(data: EpisodeData[]) {
  let filteredData = data;
  Object.entries(filters).forEach(([key, value]) => {
    if (!value.value) {
      if (value.tag === 'types') {
        filteredData = filteredData.filter(episode => episode._embedded.show.type !== key);
      } else if (value.tag === 'languages') {
        // Check if any language tags are set to false
        const anyLanguageTagFalse = Object.values(filters).filter(filter => filter.tag === 'languages' && !filter.value).length > 0;

        // Apply the filter using the determined condition
        if (anyLanguageTagFalse) {
          filteredData = filteredData.filter(episode => {
            const showLanguage = episode._embedded.show.language;
            return showLanguage !== key && showLanguage !== null;
          });
        } else {
          // If all language tags are true, include null entries
          filteredData = filteredData.filter(episode => {
            const showLanguage = episode._embedded.show.language;
            return showLanguage !== key;
          });
        }
     }  else if (value.tag === 'networks') {
        // Check if any network tags are set to false
        const anyNetworkTagFalse = Object.values(filters).some(filter => filter.tag === 'networks' && !filter.value);

        // Apply the filter using the determined condition
        if (anyNetworkTagFalse) {
          filteredData = filteredData.filter(episode => {
            const networkName = episode._embedded.show.network?.name;
            return networkName !== key && networkName !== null;
          });
        }
      } else if (value.tag === 'streamingservice') {
        // Check if any streamingservice tags are set to false
        const anyStreamingServiceTagFalse = Object.values(filters).some(filter => filter.tag === 'streamingservice' && !filter.value);

        // Apply the filter using the determined condition
        if (anyStreamingServiceTagFalse) {
          filteredData = filteredData.filter(episode => {
            const webChannelName = episode._embedded.show.webChannel?.name;
            return webChannelName !== key && webChannelName !== null;
          });
        }
      }
    }
  });

  filterPages(filteredData);

  return filteredData;
}


  // Calculate total pages based on filtered data
  function filterPages(data: EpisodeData[]) {
    const totalPages = Math.ceil(data.length / 120);
    setTotalPages(totalPages);
  }

  // Sort episodes based on selected option and direction
  function sortEpisodes(data: EpisodeData[]) {
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
function toggleAllFilters(value: boolean, tag: string) {
  const updatedFilters: Filters = {};
  for (const key in filters) {
    if (filters[key].tag === tag) {
      updatedFilters[key] = {
        ...filters[key],
        value: value,
      };
    } else {
      updatedFilters[key] = filters[key]; // Keep other filters unchanged
    }
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
    setTypesAnchorEl(null);
        setLanguagesAnchorEl(null);
        setNetworksAnchorEl(null);
        setStreamingServiceAnchorE1(null);
  };
  const handleTypesClose = () => {
    setTypesAnchorEl(null);
  }
    const handleLanguagesClose = () => {
    setLanguagesAnchorEl(null);
  }
      const handleNetworksClose = () => {
    setNetworksAnchorEl(null);
  }
    const handleStreamingServiceClose = () => {
    setStreamingServiceAnchorE1(null);
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
      <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: '30%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        backgroundColor: '#fff',
        border: '2px solid #000',
        textAlign: 'center',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
    UNDER RECONSTRUCTION
</div>

    </main>
  );
}
