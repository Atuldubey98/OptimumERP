import { ButtonGroup, IconButton } from '@chakra-ui/react'
import React from 'react'
import { GrApps } from "react-icons/gr";
import { CiViewTable } from "react-icons/ci";
export default function ViewSwitch() {
  return (
    <ButtonGroup>
        <IconButton icon={<GrApps/>} size={"xl"}/>
        <IconButton icon={<CiViewTable/>} size={"xl"}/>
    </ButtonGroup>
  )
}
