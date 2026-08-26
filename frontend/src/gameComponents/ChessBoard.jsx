{/* <div className="flex justify-center items-center ml-6">
            {board.map((row,id)=>{
                return <div className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
            })}
        </div>
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="">
                {board.map((row,id)=>{
                    return <div className="my-12 mr-4 text-2xl">{8-id}</div>
                })}
            </div>
            <div className="grid grid-cols-8 border-4 border-gray-700">
                {board.map((row,rowIdx)=>(
                    row.map((piece,pieceIdx)=>{
                        return <Square
                            rowId={8-rowIdx}
                            columId={(String.fromCodePoint(97+pieceIdx))}
                            key={`${rowIdx}-${pieceIdx}`}
                            isDark={(pieceIdx+rowIdx)%2==0?false:true}
                            piece={piece}
                        />
                    })
                ))
                }
            </div>
            <div className="ml-4">
                {board.map((row,id)=>{
                    return <div className="my-12 mr-4 text-2xl">{8-id}</div>
                })}
            </div>
        </div>
        <div className="flex justify-center items-center ml-6">
            {board.map((row,id)=>{
                return <div className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
            })}
        </div> */}