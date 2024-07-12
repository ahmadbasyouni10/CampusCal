import React, { useState, useRef } from 'react'

import {
    Box, Button,
    Modal, ModalOverlay, useRadio,
    ModalContent, ModalHeader, useRadioGroup,
    ModalBody, ModalCloseButton, FormControl,
    FormLabel, FormErrorMessage, useDisclosure,
    Input, HStack
} from "@chakra-ui/react";

import { Field, Form, Formik } from 'formik';

//should the id match the dict value?

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


export default function OLay({ Id, trigger, onCloseModal, timee, dura }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedOption, setSelectedOption] = useState('');

    const initRef = React.useRef()

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'group',
        defaultValue: selectedOption,
        onChange: setSelectedOption,
    })

    const group = getRootProps()

    const options = ['Class 1', 'Class 2', 'Class 3']
    //here is where the course options would go.. need to select between the options below


    const Overlay = () => (
        <ModalOverlay
            bg="rgba(0, 0, 0, 0.3)"
            backdropFilter="blur(10px)"
            backdropBlur="10px"
        />
    )
    
    const [overlay, setOverlay] = React.useState(<Overlay />)


    function validateName(value) {
        let error
        if (!value) {
            error = 'Value is required';
        }
        return error
    }

    React.useEffect(() => {
        if (trigger) {
            onOpen();
        }
    }, [trigger, onOpen]);

    const handleClose = () => {
        onClose();
        onCloseModal(selectedOption);
    };

    return (
        <>
            <div className="OLay">
                <Modal isCentered isOpen={isOpen} onClose={handleClose}>
                    {overlay}
                    <ModalContent>
                        <ModalHeader>{Id} Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Formik
                                initialValues={{ name: '', priority: '', time: {timee}, hours: {dura} }}
                                onSubmit={(values, actions) => {
                                    setTimeout(() => {
                                        alert(JSON.stringify(values, null, 2))
                                        actions.setSubmitting(false)
                                        setSelectedOption(values.select)
                                        handleClose();
                                    }, 1000)
                                }}>
                                {(props) => (
                                    <Form>
                                        < Field name='name' validate={validateName}>
                                            {({ field, form }) => (
                                                <FormControl isRequired>
                                                    <FormLabel>Activity Name</FormLabel>
                                                    <Input placeholder='name' {...field} />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                    <br /><br />
                                                </FormControl>
                                            )}
                                        </Field>
                                        < Field name='date' validate={validateName}>
                                            {({ field, form }) => (
                                                <FormControl isRequired>
                                                    <FormLabel>When should this be done by?</FormLabel>
                                                    <Input placeholder='date' size='md' type='datetime-local' {...field} />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                    <br /><br />
                                                </FormControl>
                                            )}
                                        </Field>
                                        < Field name='priority' validate={validateName}>
                                            {({ field, form }) => (
                                                <FormControl isRequired>
                                                    <FormLabel>What is the priority level? (1-10)</FormLabel>
                                                    <Input placeholder='Add a priority' type='number' {...field} min="1" max="10" />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                    <br /><br />
                                                </FormControl>
                                            )}
                                        </Field>
                                        < Field name='hours' validate={validateName}>
                                            {({ field, form }) => (
                                                <FormControl isRequired>
                                                    <FormLabel>How long do you want to work on it?</FormLabel>
                                                    <Input placeholder='Add a number in hours' type='number' {...field} />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                    <br /><br />
                                                </FormControl>
                                            )}
                                        </Field>
                                        < Field name='select'>
                                            {({ field, form }) =>
                                                <div>
                                                    <FormLabel>Assign to a group?</FormLabel>
                                                    <HStack {...group}>
                                                        {options.map((option) => (
                                                            <Box key={option}>
                                                                <input type="radio" {...getRadioProps({ value: option })} />
                                                                <label>{option}</label>
                                                            </Box>
                                                        ))}
                                                    </HStack>
                                                    <br/>
                                                </div>
                                            }
                                        </Field>
                                        <Button
                                            mt={4}
                                            colorScheme='teal'
                                            isLoading={props.isSubmitting}
                                            type='submit'
                                            ref={initRef}
                                        >
                                            Submit
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div >
        </>
    );
}
