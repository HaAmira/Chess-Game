// import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  Button,
  ButtonGroup
} from '@mui/material';
import toast from 'react-hot-toast';

const PawnPromotion = ({ openComponent,onClose,piecePromotionData }) => {
    // const [taskTitle,setTaskTitle] = useState("")
    // const [taskData,setTaskData] = useState("")

    const piecePromotion = (piece) => {
      onClose();
      piecePromotionData(piece);
      toast.success(`Pawn promoted to ${piece.toUpperCase()}`);
    }

    return (
    <Dialog
      open={openComponent}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0,0,0,0.3)',
        },
      }}
    //   className='w-3xs h-20 bg-black'
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: '100%',
          maxWidth: 600,
        },
      }}
    >
    {/* // <div open={openAddask}> */}
            {/* <div onClick={onClose} className=' absolute right-2 top-2 border rounded-2xl cursor-pointer'>
                <CloseIcon/>
            </div> */}
            {/* <h1>Update Piece</h1>
            <div>
                <button>Queen</button>
                <button>Rook</button>
                <button>Bishop</button>
                <button>Knight</button>
            </div> */}
            <div className='w-3xs h-20 bg-black text-center flex justify-center items-center'>
                <ButtonGroup variant="outlined" aria-label="Basic button group">
                    <Button onClick={()=>piecePromotion("r")}>♖</Button>
                    <Button onClick={()=>piecePromotion("k")}>♘</Button>
                    <Button onClick={()=>piecePromotion("b")}>♗</Button>
                    <Button onClick={()=>piecePromotion("q")}>♕</Button>
                </ButtonGroup>
            </div>


        </Dialog>
        // </div>
    )
}

export default PawnPromotion


//   wr: "♖",
//   wn: "♘",
//   wb: "♗",
//   wq: "♕",