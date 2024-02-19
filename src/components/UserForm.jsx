import {
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Button,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export default function UserForm(props) {
  let {
    fetchUser,
    teamList,
    isOpen,
    onClose,
    userDetails,
    updateUser,
    setUserDetails,
  } = props;

  const [curTeamUserList, setCurTeamUserList] = useState([]);
  const [disableSave, setDisableSave] = useState(false);

  const saveForm = useCallback(() => {
    updateUser(userDetails);
    onClose();
  }, [userDetails]);
  const fetchTeamUser = async () => {
    let userList = await fetchUser({});
    setCurTeamUserList(userList);
  };
  const updateUserDetail = useCallback((keyProp, value) => {
    setUserDetails((prevState) => ({
      ...prevState,
      [keyProp]: value.trim(),
    }));
  }, []);

  useEffect(() => {
    fetchTeamUser();
  }, []);

  useEffect(() => {
    let hasEmptyValue = Object.values(userDetails).some((val) => val === "");
    setDisableSave(hasEmptyValue);
  }, [userDetails]);

  return (
    <Modal colorScheme="blue" onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              value={userDetails.name}
              onChange={(e) => updateUserDetail("name", e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Designation</FormLabel>
            <Input
              value={userDetails.designation}
              onChange={(e) => updateUserDetail("designation", e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Team</FormLabel>
            <Select
              value={userDetails.team}
              placeholder="Select Team"
              onChange={(e) => updateUserDetail("team", e.target.value)}
            >
              {teamList.map((team) => (
                <option value={team.id} key={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Manager</FormLabel>
            <Select
              value={userDetails.manager}
              placeholder="Select Manager"
              onChange={(e) => updateUserDetail("manager", e.target.value)}
            >
              {curTeamUserList.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter columnGap="0.5rem">
          <Button variant="ghost" colorScheme="blue" onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="blue"
            isDisabled={disableSave}
            onClick={saveForm}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
