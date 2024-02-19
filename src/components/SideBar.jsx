import { Input, Select, useDisclosure, Text } from "@chakra-ui/react";
import UserForm from "./UserForm";
import { useState, useCallback, useEffect } from "react";
import plusSvg from "../assets/plus.svg";
import editSvg from "../assets/edit.svg";

const userObj = {
  name: "",
  designation: "",
  team: "",
  manager: "",
};

export default function SideBar(props) {
  let {
    userList,
    teamList,
    selectedTeam,
    searchText,
    teamHash,
    setSearchText,
    setSelectedTeam,
    fetchUser,
    updateUser,
  } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userDetails, setUserDetails] = useState(userObj);
  const [updatedTeamList, setUpdatedTeamList] = useState([]);

  const openUserForm = useCallback((user = userObj) => {
    setUserDetails(user);
    onOpen();
  }, []);

  const searchUser = useCallback(
    (event) => setSearchText(event.target.value),
    []
  );
  const filterTeam = useCallback(
    (event) => setSelectedTeam(event.target.value),
    []
  );

  useEffect(() => {
    setUpdatedTeamList([{ id: "-1", name: "All" }, ...teamList]);
  }, [teamList]);

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <Text
          fontSize="4xl"
          color="var(--chakra-colors-blue-600)"
          fontWeight="medium"
        >
          Org Tree
        </Text>
        <div className="user-add" onClick={() => openUserForm()}>
          <img src={plusSvg} alt="plus icon" />
        </div>
      </div>
      <div className="sidebar-action-bar">
        <div className="user-search">
          <div className="action-label">Search By User</div>
          <Input
            value={searchText}
            onChange={searchUser}
            placeholder="Search"
          />
        </div>
        <div className="team-filter">
          <div className="action-label">Filter By Team</div>
          <Select value={selectedTeam} onChange={filterTeam} cursor="pointer">
            {updatedTeamList.map((team) => (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="user-list">
        {userList.map((user) => (
          <div key={user.id} className="user-detail-container">
            <div className="user-detail">
              <div className="user-name">{user.name}</div>
              <div className="user-desig">
                {user.designation}
                {teamHash[user.team] && ` | ${teamHash[user.team]}`}
              </div>
            </div>
            {user.designation !== "CEO" && (
              <div className="user-edit" onClick={() => openUserForm(user)}>
                <img src={editSvg} alt="edit icon" />
              </div>
            )}
          </div>
        ))}
      </div>
      <UserForm
        fetchUser={fetchUser}
        teamList={teamList}
        isOpen={isOpen}
        onClose={onClose}
        userDetails={userDetails}
        updateUser={updateUser}
        setUserDetails={setUserDetails}
      />
    </div>
  );
}
