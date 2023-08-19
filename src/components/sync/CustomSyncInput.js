import axios  from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState, useRef, createRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { usePopper } from 'react-popper';
import CustomCurrency from './SyncCurrency';

export default function CustomSyncInput(props) {
    
    const [listOfCurrencies, setList] = useState([])
    const [searchResult, setSearchResult] = useState([])
    const [value, setValue] = useState('');
    const [isOpen, setOpen] = useState(false);
    const outerFormRef = useRef(null)
    const [chooseIndex, setChosenIndex] = useState(-1);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const itemsRef = useRef([]);


    const initialClick = () => { 
        axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/currencies`)
        .then(res => {
        setList(res.data['currencies'])
        setOpen(true)
        })
        .catch(error => console.log(error))
    }

    const updateState = (index) => {
        const newSelectedItems = new Set(selectedItems);
        if (selectedItems.has(index)) {
            newSelectedItems.delete(index);
        } else {
            newSelectedItems.add(index);
        }
        setSelectedItems(newSelectedItems);
    }

    useEffect(() => {
        itemsRef.current = new Array(searchResult.length).fill(null).map((_, i) => itemsRef.current[i] || createRef());
    }, [searchResult, listOfCurrencies]);

    useEffect(() => {
        if (value !== "") {
        axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/currencies/${value}`)
            .then(res => {
                setSearchResult(res.data['result'])
                setOpen(true)
            })
            .catch(error => console.log(error))
        }
    }, [value])

    useEffect(() => {
        if (isOpen) {
            
        const handleOutsideClick = (e) => {
            if (outerFormRef.current && !outerFormRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
    
        window.addEventListener("mousedown", handleOutsideClick);
        
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
        };
        }
    }, [isOpen, value])

    useEffect(() => {
        if (!isOpen) return;
        const element = outerFormRef.current;
        if (!element) return;

        const keyDownHandler = (event) => {
            let newIdx = 0
            if (event.which === 40) { 
                newIdx = (chooseIndex + 1) % searchResult.length;
                
            } 
            if (event.which === 38) { 
                newIdx = (chooseIndex - 1 + searchResult.length) % searchResult.length;
            }

            if (event.which === 13) { 
                if (chooseIndex >= 0 && chooseIndex < searchResult.length) {
                    updateState(chooseIndex);
                    newIdx = chooseIndex;
                }
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
    }, [isOpen, chooseIndex, selectedItems, searchResult.length]);


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
                
                <TextField onClick = {initialClick} ref = {setReferenceElement} placeholder='Type to begin searching' fullWidth = {false} className='w-[300px] rounded-xl'
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /> </InputAdornment>
                }} 
                value = {value} 
                onChange = {(e) => setValue(e.target.value)}
                /> 
    
                <p className='font-normal text-sm text-gray-500'> 
                    {props.bottomText}
                </p>
            </div>
    
            <div ref = {setPopperElement} style = {styles.popper} {...attributes.popper} className='z-10'>
                {isOpen && 
                <div ref = {outerFormRef} tabIndex={0}
                className='bg-white w-[300px] max-h-[180px] space-y-4 overflow-y-auto shadow-lg shadow-grey-300 pt-2 rounded-xl'> 
                    <div> 
                    {value === "" ? 
                    (listOfCurrencies.length > 0 && 
                        listOfCurrencies.map((currency, index) => <CustomCurrency updateState = {updateState} isActive = {chooseIndex == index} index = {index} isSelected = {selectedItems.has(index)} ref = {itemsRef.current[index]} name={currency}/>))
                    :
                    (searchResult.length > 0 ?
                        (searchResult.map((currency, index) => <CustomCurrency updateState = {updateState} isActive = {chooseIndex == index} index = {index} isSelected = {selectedItems.has(index)} ref = {itemsRef.current[index]} name={currency}/>))
                        : (<div className='text-sm text-center text-gray-500 px-4 py-4 '> No results were found </div>)
                    )}
                    </div>
                </div>
                }
            </div>
        </div>
    )

    
}


