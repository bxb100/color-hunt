<br>
<br>
<p align="center">
<img src="/assets/color-hunt-icon.png" width="140" height="140"  />
</p>

<h1 align="center"><sup>Color Hunt</sup></h1>

<p align="center">
Color Palettes for Designers and Artists

<img width="862" src="metadata/1.png"  />
<img width="862" src="metadata/2.png"  />
<img width="862" src="metadata/3.png"  />
<img width="862" src="metadata/4.png"  />
</p>

## Introduction

This extension features all the functionalities of the [Color Hunt](https://colorhunt.co/) website. Users can browse,
search, filter, and copy color palettes to their clipboard.

## Bugs

The extension utilizes [satori](https://github.com/vercel/satori) to generate SVGs, which consumes a significant amount
of memory. Given that Raycast currently has a memory limit of `500MB`, this may cause the `Grid View` scroll to freeze.

## Installation

Currently, you need to clone this repo and install it locally in developer mode.

You will need to have [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io/) installed.

1. Clone this repo `git clone https://github.com/bxb100/color-hunt.git`
2. Go to the folder `cd color-hunt`
3. Install dependencies `pnpm install`
4. Go to Raycast, run `Import Extension` and select the folder
