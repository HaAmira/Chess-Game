// import React from 'react'
// import { Typography } from "@mui/material";
import Typography from '@mui/material/Typography';

const pieces = {
  wr: "♖",
  wn: "♘",
  wb: "♗",
  wq: "♕",
  wk: "♔",
  wp: "♙",

  br: "♜",
  bn: "♞",
  bb: "♝",
  bq: "♛",
  bk: "♚",
  bp: "♟",
};

const Piece = ({piece}) => {
    if(!piece){
        return null;
    }
  return (
    <Typography
      sx={{
        fontSize: "42px",
        userSelect: "none",
      }}
      className='text-center cursor-pointer'
    >
      {pieces[piece]}
    </Typography>
  )
}

export default Piece