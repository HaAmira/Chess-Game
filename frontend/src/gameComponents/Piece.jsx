import wk from "../assets/WhitePiece/wK.png";
import wkn from "../assets/WhitePiece/wKn.png";
import wq from "../assets/WhitePiece/wQ.png";
import wb from "../assets/WhitePiece/wB.png";
import wr from "../assets/WhitePiece/wR.png";
import wp from "../assets/WhitePiece/wP.png";
import bk from "../assets/BlackPiece/bk.png";
import bkn from "../assets/BlackPiece/bkn.png";
import bq from "../assets/BlackPiece/bq.png";
import bb from "../assets/BlackPiece/bb.png";
import br from "../assets/BlackPiece/br.png";
import bp from "../assets/BlackPiece/bp.png";

const pieces = {
  wr: wr,
  wn: wkn,
  wb: wb,
  wq: wq,
  wk: wk,
  wp: wp,

  br: br,
  bn: bkn,
  bb: bb,
  bq: bq,
  bk: bk,
  bp: bp,
};

const Piece = ({ piece }) => {
  if (!piece) return null;

  const isWhite = piece[0] === "w";

  return (
    <img
      src={pieces[piece]}
      alt={piece}
      draggable="false"
      className={`
        w-[75%]
        h-[75%]
        object-contain
        select-none
        pointer-events-none

        ${isWhite ? `
            brightness-0
            invert
            drop-shadow-[1px_0_0_white]
            drop-shadow-[-1px_0_0_white]
            drop-shadow-[0_1px_0_white]
            drop-shadow-[0_-1px_0_white] `
          : ""
        }
      `}
    />
  );
};

export default Piece;