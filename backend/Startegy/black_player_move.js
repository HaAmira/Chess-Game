solve=({ from, to }) => {
    let success = false;

    const f = from.charCodeAt(0) - 97;
    const l = Number(from[1]);

    const ft = to.charCodeAt(0) - 97;
    const lt = Number(to[1]);

    const piece = initialBoard[f][l];

    if (piece === "bp") {
      console.log("Black Pawn");

      if (f === 1) {
        if (
          (ft === f + 1 && lt === l) ||
          (ft === f + 2 && lt === l)
        ) {
          success = true;
        }
      } else {
        if (
          (ft === f + 1 && lt === l) ||
          (ft === f + 1 && Math.abs(lt - l) === 1)
        ) {
          success = true;
        }
      }
    }

    else if (piece === "wp") {
      console.log("White Pawn");

      if (f === 6) {
        if ((ft === f - 1 && lt === l) || (ft === f - 2 && lt === l)) {
          success = true;
        }
      } 
      else {
        if ((ft === f - 1 && lt === l) || (ft === f - 1 && Math.abs(lt - l) === 1)) {
          success = true;
        }
      }
    }

    console.log(success ? "Valid Move" : "Invalid Move");

    socket.emit("moveReply", {
      success,
      from,
      to,
    });
  }