import { useEffect, useState, useRef, useCallback, createRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment, CircularProgress, Box  } from '@mui/material';
import { usePopper } from 'react-popper';
import useDebounce from '../../hooks/useDebounce';
import Currency from './Currency';
import axios  from 'axios';

export default function CustomInput(props) {

    const [value, setValue] = useState('');
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setOpen] = useState(false);
    const [latestTime, setLatestTime] = useState(0);
    const [chooseIndex, setChosenIndex] = useState(-1);

    const itemsRef = useRef([])

    const [selectedItems, setSelectedItems] = useState(new Set());

    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);

    const debouncedValue = useDebounce(value, 1000)
    const containerRef = useRef(null);

    const updateState = (index) => {
        const newSelectedItems = new Set(selectedItems);
        if (selectedItems.has(index)) {
            newSelectedItems.delete(index);
        } else {
            newSelectedItems.add(index);
        }
        setSelectedItems(newSelectedItems);
    }

    const inputHandler = (e) => {
        setValue(e.target.value)
        setLatestTime(Date.now())
    }

    useEffect(() => {
        if (value === "") {
            setResults([]);
            return;
        }
    
        if (debouncedValue) {
            
            setIsLoading(true)
            const getResults =  () => {
                axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/countries/${debouncedValue}`)
                    .then((result) => {
                        setOpen(true)
                        setResults(JSON.parse(result.data))
                        setIsLoading(false)
                    })
                    .catch(error => {console.log(error)
                            setIsLoading(false)
                            return;
                        }
                    )
                }
            setTimeout(() => getResults(), 1000)
        }
    

    }, [debouncedValue, latestTime, value])

    useEffect(() => {
        itemsRef.current = new Array(results.length).fill(null).map((_, i) => itemsRef.current[i] || createRef());
    }, [results]);
    

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
    
        window.addEventListener("mousedown", handleOutsideClick);
        
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, debouncedValue]);

    useEffect(() => {
        if (!isOpen) return;
        const element = containerRef.current;
        if (!element) return;

        const keyDownHandler = (event) => {
            let newIdx = 0 
            if (event.which === 40) { 
                newIdx = (chooseIndex + 1) % results.length;
                
            } 
            if (event.which === 38) { 
                newIdx = (chooseIndex - 1 + results.length) % results.length;
            }

            if (event.which === 40 || event.which === 38) {
                const targetRef = itemsRef.current[newIdx];
                if (targetRef && targetRef.current) {
                    targetRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    });
                }
            }

            if (event.which === 13) { 
                if (chooseIndex >= 0 && chooseIndex < results.length) {
                    updateState(chooseIndex);
                    newIdx = chooseIndex;
                }
            }
            setChosenIndex(newIdx);
        }

        const escapeHandler = (event) => {
            if (event.which === 27) {
                setOpen(false);
            }
        }
    
        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keydown", escapeHandler);
        
        
        return () => {
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("keydown", escapeHandler);
        };
    }, [isOpen, chooseIndex, selectedItems, results.length]);
    

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
        {
            name: 'preventOverflow',
            options: {
            boundary: referenceElement,
            },
        },
        ],
    placement : "bottom-start",
    });


    return (
        <div>
            <div> 
                <p className='text-sm font-normal text-gray-500'> 
                {props.topText}
                </p>
                
                <TextField 
                ref = {setReferenceElement} 
                placeholder='Type to begin searching' 
                fullWidth = {false} 
                className='w-[300px] rounded-xl'
                InputProps={{
                    startAdornment: 
                    <InputAdornment position="start">
                        <SearchIcon /> 
                    </InputAdornment>,
                    endAdornment: isLoading ? 
                    <InputAdornment position='end'>
                        <Box className= "flex"> 
                            <CircularProgress size = "1rem" color = "inherit"/> 
                        </Box>
                    </InputAdornment> 
                    : <div> </div>
                }} 
                value = {value} 
                onChange = {inputHandler}
                /> 

                <p className='font-normal text-sm text-gray-500'> 
                    {props.bottomText}
                </p>
            </div>

        

            <div ref = {setPopperElement} style = {styles.popper} {...attributes.popper} className='z-10'> 
                {isOpen && 
                    <div ref = {containerRef} tabIndex={0} 
                    className='bg-white w-[300px] max-h-[180px] space-y-0 shadow-lg shadow-grey-300 overflow-y-auto z-10 pt-2 scroll-smooth rounded-xl'> 
                    {results.length > 0 ? 
                        results.map((currency, index) => 
                        <Currency  
                        ref= {itemsRef.current[index]}
                        updateState = {updateState}
                        isActive = {chooseIndex == index}
                        isSelected = {selectedItems.has(index)}
                        index = {index}
                        {...currency}> </Currency>) 
                        : (value !== "") && <div className='text-sm text-center text-gray-500 px-4 py-4'> No results were found </div> }
                    {results.length == 0 && value === "" &&  <div className='text-sm text-center text-gray-500 px-4 py-4'> No results were found </div>}
                        
                </div>}
            </div>
            
        </div>
    )
}


