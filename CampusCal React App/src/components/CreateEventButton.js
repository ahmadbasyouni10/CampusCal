import React from "react";
import { ChakraProvider, CSSReset, Box, Container } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuList, MenuItem, Input } from "@chakra-ui/react";

export default function App() {
	return (
		<ChakraProvider>
			<CSSReset />
			<Container maxW="container.sm" mt={10}>
				<Box>
					<Menu>
						<MenuButton as={Button} 
									rightIcon={<ChevronDownIcon />}>
							Create Event
						</MenuButton>
						<MenuList>
							<MenuItem colorScheme='#F2CC8F'>Exam</MenuItem>
							<MenuItem colorScheme='#F2CC8F'>Work</MenuItem>
							<MenuItem colorScheme='#F2CC8F'>Leisure</MenuItem>
							<MenuItem colorScheme='#F2CC8F'>Project</MenuItem>
							<MenuItem colorScheme='#F2CC8F'>Fitness</MenuItem>
                            <MenuItem colorScheme='#F2CC8F'>Nap</MenuItem>
                           
						</MenuList>
					</Menu>
				</Box>
			</Container>
		</ChakraProvider>
	);
}

// will maybe add another button that takes input to create new buttons... we shall see