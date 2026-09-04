// import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  Button,
} from '@mui/material';

const GameOver = ({ openComponent,onClose,message }) => {

    console.log("GameOver:- ",openComponent,",",message);

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
    {/* <div className='mb-10'> */}
            <div className='w-fit px-15 py-2 rounded-md bg-black m-auto text-center'>
                <h1 className='text-white my-2 font-semibold'>Game Over</h1>
                <h2 className='text-white mt-4'>{message}</h2>
                <Button onClick={onClose} sx={{width: '100px', backgroundColor: 'green', color: 'white', marginTop: '25px', marginBottom: '15px'}}>New Game</Button>
            </div>
    {/* </div> */}
      
        </Dialog>
    )
}

export default GameOver

// import {
//   Dialog,
//   Button,
// } from '@mui/material';

// const GameOver = () => {
//   return (
//     <Dialog 
//     ></Dialog>
//   )
// }

// export default GameOver