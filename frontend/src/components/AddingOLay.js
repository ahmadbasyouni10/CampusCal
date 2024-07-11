import React from 'react'
import Popup from './components/AddingOLay.css'
import { ChakraProvider, CSSReset, Box, Container } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {Button, Menu, MenuButton, 
        MenuList, MenuItem, Radio,
        RadioGroup, Popover, PopoverTrigger,
        PopoverContent, PopoverHeader, PopoverBody,
        PopoverFooter, PopoverArrow, PopoverCloseButton,  
        PopoverAnchor, FormControl, FormLabel,
        FormErrorMessage, FormHelperText,} from "@chakra-ui/react";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import { Field, Form, Formik } from 'formik';
import Rating from "./Rating";


//should i take out the open popup
function RadioCard(props) {
	const { getInputProps, getRadioProps } = useRadio(props)

	const input = getInputProps()
	const checkbox = getRadioProps()

	return (
		<Box as='label'>
			<input {...input} />
			<Box
				{...checkbox}
				cursor='pointer'
				borderWidth='1px'
				borderRadius='md'
				boxShadow='md'
				_checked={{
					bg: 'teal.600',
					color: 'white',
					borderColor: 'teal.600',
				}}
				_focus={{
					boxShadow: 'outline',
				}}
				px={5}
				py={3}
			>
				{props.children}
			</Box>
		</Box>
	)
}


export default function Popup(props) {
	const {getRootProps, getRadioProps} = useRadioGroup({
		name: 'framework',
	defaultValue: 'react',
	onChange: console.log,
})

	const options = ['Class 1', 'Class 2', 'Class 3'] 
	//here is where the course options would go.. need to select between the options below

	const group = getRootProps()
	const initRef = React.useRef()

	function validateName(value) {
		let error
		if (!value) {
			error = 'Name is required'
		}
		return error
	}

	return (props.trigger) ? (
		<div className="popup">
			<div className="popup-inner">
				<button className="close-btn">Log</button>
				{props.children}
			</div>

			<Popover closeOnBlur={false} placement='auto' initialFocusRef={initRef}>
				{({ isOpen, onClose }) => (
					<>
						<Portal>
							<PopoverContent>
								<PopoverHeader>Event Details</PopoverHeader>
								<PopoverCloseButton />
								<PopoverBody>
									<Box>
										<Formik
											onSubmit={(values, actions) => {
												setTimeout(() => {
													alert(JSON.stringify(values, null, 2))
													actions.setSubmitting(false)
												}, 1000)
											}}
										>
											{(props) => (
												<Form>
													<Field name='name' validate={validateName}>
														{({ field, form }) => (
															<FormControl isInvalid={form.errors.name && form.touched.name}>
																<br /><br />
																<FormLabel>Activity Name</FormLabel>
																<Input {...field} />
																<FormErrorMessage>{form.errors.name}</FormErrorMessage>
																<br />
																<FormLabel>When should this be done by?</FormLabel>
																<Input placeholder='Select Date and Time' size='md' type='datetime-local' />
																<FormErrorMessage>{form.errors.name}</FormErrorMessage>
																<br />
																<FormLabel>What is the priority level?</FormLabel>
																<ThemeProvider>
																	<CSSReset />
																	<Rating
																		size={48}
																		icon="star"
																		scale={5}
																		fillColor="gold"
																		strokeColor="grey"
																	/>
																	</ThemeProvider>
																<FormErrorMessage>{form.errors.name}</FormErrorMessage>
																<br />
																<FormLabel>How long do you want to work on it?</FormLabel>
																<Input {...field} />
																<FormErrorMessage>{form.errors.name}</FormErrorMessage>



																

															
																<HStack {...group}>
																	{options.map((value) => {
																		const radio = getRadioProps({ value })
																		return (
																			<RadioCard key={value} {...radio}>
																				{value}
																			</RadioCard>
																		)
																	})}
																</HStack>
																
															
																<FormLabel>Assign to a group?</FormLabel>
																<Select placeholder='Select Group'>
																	<option>United Arab Emirates</option>
																	<option>Nigeria</option>
																</Select>
															</FormControl>
														)}
													</Field>
													<Button
														mt={4}
														colorScheme='teal'
														isLoading={props.isSubmitting}
														type='submit'
													>
														Submit
													</Button>
												</Form>
											)}
										</Formik>
									</Box>
									<Button
										mt={4}
										colorScheme='blue'
										onClick={onClose}
										ref={initRef}
									>
										Log
									</Button>
								</PopoverBody>
							</PopoverContent>
						</Portal>
					</>
				)}
			</Popover>
		</div>
	) : "";


}

// probably have to differentiate between submit and log buttons... will see which works better for now
// will also have to assign it to a group most likely

// might instead wanna use <h2>Activity Name</h2> as the form label titles
// the groups would need to be the values in the db

// can do transitions later if desired