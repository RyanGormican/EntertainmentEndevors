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
useEffect(() => {
  async function fetchEpisodes() {
    try {
      const response = await fetch('https://api.tvmaze.com/schedule/full');
      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }
      const data: EpisodeData[] = await response.json();
      const currentTimestamp = new Date().getTime();
      const newEpisodes = data.filter(episode => {
        const episodeTimestamp = new Date(episode.airstamp).getTime();
        return episodeTimestamp > currentTimestamp;
      });
      setTotalEpisodes(newEpisodes);

      const filteredEpisodes = applyFilters(newEpisodes);
      limitView(filteredEpisodes);

      // Calculate unique types
      const uniqueTypes = Array.from(new Set(newEpisodes.map(episode => episode._embedded.show.type)));

      // Initialize initialFilters with unique types
      const initialFilters: Filters = uniqueTypes.reduce((acc, type) => {
        acc[type] = { value: true, tag: 'types' };
        return acc;
      }, {} as Filters);
      setFilters(initialFilters);
      // Calculate unique languages
      const uniqueLanguages = Array.from(new Set(newEpisodes.map(episode => episode._embedded.show.language)))
        .filter(language => language !== null) as string[];

      // Initialize initialFilters with unique languages
      const languageFilters: Filters = uniqueLanguages.reduce((acc, language) => {
        acc[language] = { value: true, tag: 'languages' };
        return acc;
      }, {} as Filters);
  
      setFilters(prevFilters => ({
        ...prevFilters,
        ...languageFilters
      }));
       // Extract unique network names
    const uniqueNetworks = Array.from(new Set(newEpisodes.map(episode => episode._embedded.show.network?.name)))
  .filter(network => network !== undefined && network !== null);
  
  const uniqueNetworksFiltered = uniqueNetworks.filter(network => network !== undefined) as string[];
      // Initialize initialFilters with unique networks
      const networkFilters = uniqueNetworksFiltered.reduce((acc, network) => {
        acc[network] = { value: true, tag: 'networks' };
        return acc;
      }, {} as Filters);
       setFilters(prevFilters => ({
        ...prevFilters,
        ...networkFilters
      }));


        const uniqueStreamingService = Array.from(new Set(newEpisodes.map(episode => episode._embedded.show.webChannel?.name)))
  .filter(webChannel => webChannel !== undefined && webChannel !== null);
        // Initialize initialFilters with unique streaming services
         const uniquestreamFiltered = uniqueNetworks.filter(webChannel => webChannel !== undefined) as string[];
      const streamFilters = uniquestreamFiltered.reduce((acc, streamservice) => {
        acc[streamservice] = { value: true, tag: 'streamingservice' };
        return acc;
      }, {} as Filters);
       setFilters(prevFilters => ({
        ...prevFilters,
        ...streamFilters
      }));
      console.log(filteredEpisodes);
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


// Apply filters to episodes data
function applyFilters(data: EpisodeData[]) {
  let filteredData = data;

  Object.entries(filters).forEach(([key, value]) => {
    if (!value.value) {
      if (value.tag === 'types') {
        filteredData = filteredData.filter(episode => episode._embedded.show.type !== key);
      } else if (value.tag === 'languages') {
        filteredData = filteredData.filter(episode => episode._embedded.show.language !== key);
      }else if (value.tag === 'networks') {
        filteredData = filteredData.filter(episode => episode._embedded.show.network?.name !== key);
      }else if (value.tag === 'streamingservice') {
        filteredData = filteredData.filter(episode => episode._embedded.show.webChannel?.name !== key);
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
<MenuItem onClick={(event) => setTypesAnchorEl((prevState) => prevState ? null : event.currentTarget as HTMLElement)}>
  <div>Types</div>
</MenuItem>
<MenuItem onClick={(event) => setLanguagesAnchorEl((prevState) => prevState ? null : event.currentTarget as HTMLElement)}>
  <div>Languages</div>
</MenuItem>
<MenuItem onClick={(event) => setNetworksAnchorEl((prevState) => prevState ? null : event.currentTarget as HTMLElement)}>
  <div>Networks</div>
</MenuItem>
<MenuItem onClick={(event) => setStreamingServiceAnchorE1((prevState) => prevState ? null : event.currentTarget as HTMLElement)}>
  <div>Streaming Service</div>
</MenuItem>       

        </Popover>
<Popover
  anchorEl={typesAnchorEl}
  open={Boolean(typesAnchorEl)}
  onClose={handleTypesClose}
  anchorOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'left',
  }}
>
  <MenuItem>
    {/* Buttons to select/deselect all filters */}
    <Button onClick={() => toggleAllFilters(true,'types')}>Select All</Button>
    <Button onClick={() => toggleAllFilters(false,'types')}>Deselect All</Button>
  </MenuItem>
  {/* Filter checkboxes for types */}
  {Object.entries(filters)
    .filter(([_, value]) => value.tag === 'types')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => (
      <MenuItem key={key}>
        <span>{key}</span>
        <input type="checkbox" checked={value.value} onChange={() => handleFilterChange(key, !value.value)} />
      </MenuItem>
    ))}
</Popover>

  
        <Popover
            anchorEl={languagesAnchorEl}
          open={Boolean(languagesAnchorEl)}
          onClose={handleLanguagesClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
           <MenuItem>
            {/* Buttons to select/deselect all filters */}
            <Button onClick={() => toggleAllFilters(true,'languages')}>Select All</Button>
            <Button onClick={() => toggleAllFilters(false,'languages')}>Deselect All</Button>
          </MenuItem>
          {/* Filter checkboxes */}
       {Object.entries(filters)
    .filter(([_, value]) => value.tag === 'languages')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => (
      <MenuItem key={key}>
        <span>{key}</span>
        <input type="checkbox" checked={value.value} onChange={() => handleFilterChange(key, !value.value)} />
      </MenuItem>
    ))}

  </Popover>
  
        <Popover
            anchorEl={networksAnchorE1}
          open={Boolean(networksAnchorE1)}
          onClose={handleNetworksClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
           <MenuItem>
            {/* Buttons to select/deselect all filters */}
            <Button onClick={() => toggleAllFilters(true,'networks')}>Select All</Button>
            <Button onClick={() => toggleAllFilters(false,'networks')}>Deselect All</Button>
          </MenuItem>
          {/* Filter checkboxes */}
       {Object.entries(filters)
    .filter(([_, value]) => value.tag === 'networks')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => (
      <MenuItem key={key}>
        <span>{key}</span>
        <input type="checkbox" checked={value.value} onChange={() => handleFilterChange(key, !value.value)} />
      </MenuItem>
    ))}

  </Popover>

      <Popover
            anchorEl={streamingServiceAnchorE1}
          open={Boolean(streamingServiceAnchorE1)}
          onClose={handleStreamingServiceClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
           <MenuItem>
            {/* Buttons to select/deselect all filters */}
            <Button onClick={() => toggleAllFilters(true,'streamingservice')}>Select All</Button>
            <Button onClick={() => toggleAllFilters(false,'streamingservice')}>Deselect All</Button>
          </MenuItem>
          {/* Filter checkboxes */}
       {Object.entries(filters)
    .filter(([_, value]) => value.tag === 'streamingservice')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => (
      <MenuItem key={key}>
        <span>{key}</span>
        <input type="checkbox" checked={value.value} onChange={() => handleFilterChange(key, !value.value)} />
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
          {sortDirection === 'asc' ? <Icon icon="mdi:sort-descending" color="#e8eaea" width="60" /> : <Icon icon="mdi:sort-ascending" color="#e8eaea" width="60" />}
        </Button>
      </div>

      {/* Grid container for displaying episodes */}
      <div className="gridWrapper">
      <Episode episodes={episodes}/>
     
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
      </div>
    </main>
  );
}
