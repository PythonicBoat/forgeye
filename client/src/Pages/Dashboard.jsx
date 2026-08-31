import React from 'react';
import Map from '../Components/Map';
import Life from '../Components/Life';
import Feed from '../Components/Feed';
import Graph from '../Components/Graph';
import Ladle from '../Components/Ladle';

export default function Dashboard() {
  return (
    <main className="grid grid-cols-3 grid-rows-2 gap-4 p-4 bg-black h-[100dvh] w-full box-border">
      <Map />
      <Life />
      <Feed clickable={true} bRadius={true} id="5" name="Tapping Station" ladleView="23" />
      <Graph />
      <Ladle />
    </main>
  );
}
