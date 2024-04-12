import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import Divider from '@mui/material/Divider';
import './globals.css';
const Header: React.FC<HeaderProps> = ({  }) => {


  return (
    <header className="flex justify-between items-center p-12 flex-col">
      <Link href="/Home">
        <div className="title">EntertainmentEndevors</div>
      </Link>
      <Divider style={{width: '100vw'}} />
      <div className="links">
        <a href="https://www.linkedin.com/in/ryangormican/">
          <Icon icon="mdi:linkedin" color="#0e76a8" width="60" />
        </a>
        <a href="https://github.com/RyanGormican/EntertainmentEndevors">
          <Icon icon="mdi:github" color="#e8eaea" width="60" />
        </a>
        <a href="https://ryangormicanportfoliohub.vercel.app/">
          <Icon icon="teenyicons:computer-outline" color="#199c35" width="60" />
        </a>
      </div>
    
 

    </header>
  );
};

export default Header;