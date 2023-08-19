import { Checkbox } from "@mui/material"
import React from "react"

const CustomCurrency = React.forwardRef((props, ref) => {

    const handleSelection = (event) => {
        if (event.which === 13 || event.type === "click") {
            event.preventDefault();
            props.updateState(props.index);
        }
    };

    return (
        <div
        ref = {ref}
        className={`flex flex-row text-sm 
        ${props.isActive ? "bg-teal-100": `${props.index % 2 == 0 ? "bg-gray-100" : "bg-white"}`} 
        justify-between items-center px-2 py-2 
        `}>
            
            <div> 
                {props.name}
            </div>

            <div className=""> 
                <Checkbox 
                checked={props.isSelected} 
                onClick={handleSelection}
                sx={{ '&.Mui-checked': {
                color: "#065f46",
                },}}/> 
            </div>
        </div>
    )
})

export default CustomCurrency;