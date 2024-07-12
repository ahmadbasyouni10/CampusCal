import React, {useState} from "react";
import {
    ChakraProvider, CSSReset, extendTheme,
    Button, Menu, MenuButton,
    MenuList, MenuItem
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import "./CreateEventButton.css"
import OLay from "./AddingOLay"

export default function Create() {
    const theme = extendTheme({
        styles: {
            global: {
                body: {
                    bg: "",
                },
            },
        },
    });

    const [selectedId, setSelectedId] = useState(null);
    const [modalTrigger, setModalTrigger] = useState(false);

    const handleMenuItemClick = (id) => {
        setSelectedId(id);
        setModalTrigger(true); // Trigger the modal
    };

    const handleCloseModal = () => {
        setModalTrigger(false);
    };

    return (
        <ChakraProvider theme={theme} resetCSS={false} disableGlobalStyle={true}>
            <CSSReset />
            <Menu>
                <MenuButton as={Button}
                    borderRadius='30px'
                    rightIcon={<ChevronDownIcon />}
                    theme={theme}
                    backgroundColor={'#F2CC8F'}
                >
                    Create
                </MenuButton>
                <MenuList className="menuItems">
                    <MenuItem onClick={() => handleMenuItemClick("Exam")}>Exam</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("Project")}>Project</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("Assignment")}>Assignment</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("Work")}>Work</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("Leisure")}>Leisure</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("Fitness")}>Fitness</MenuItem>
                </MenuList>
            </Menu>
            {modalTrigger && (
                <OLay Id={selectedId} trigger={modalTrigger} onCloseModal={handleCloseModal}/>
            )}
        </ChakraProvider>
    );
}
