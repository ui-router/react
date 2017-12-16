import React from 'react';
import { UISref } from '@uirouter/react';

export const Menu = () => (
  <div className="app-menu">
    <UISref to="home">
      <a>Home</a>
    </UISref>
    <UISref to="about">
      <a>About</a>
    </UISref>
  </div>
);
