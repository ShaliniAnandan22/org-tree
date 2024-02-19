import { useCallback, useEffect, useState } from "react";
import "./App.scss";
import OrgTree from "./components/OrgTree";
import SideBar from "./components/SideBar";
import axios from "axios";

function App() {
  const [userList, setUserList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("-1");
  const [searchText, setSearchText] = useState("");
  const [teamHash, setTeamHash] = useState({});

  const fetchTeam = useCallback(async () => {
    const response = await axios.get(`/api/teams`);
    let teamList = response.data.teams;

    setTeamList(teamList);

    let teamHash = teamList.reduce((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {});
    setTeamHash(teamHash);
  }, []);
  const fetchUser = useCallback(async (params) => {
    const response = await axios.get(`/api/users`, { params });
    return response.data.users;
  }, []);

  const updateUserList = useCallback(async () => {
    let teamId = selectedTeam === "-1" ? "" : selectedTeam;
    let userList = await fetchUser({ teamId, search: searchText });
    setUserList(userList);
  }, [selectedTeam, searchText]);

  const updateUser = useCallback(async (params) => {
    let { id } = params;
    let request = await axios.post(`/api/user`, params);
    let userObj = request.data.user;

    if (id) {
      setUserList((userList) => {
        return userList.map((user) => {
          if (user.id === id) return { ...user, ...params };
          return user;
        });
      });
    } else if (userObj) setUserList((userList) => [...userList, userObj]);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateUserList();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedTeam, searchText]);

  return (
    <div className="app-container">
      <SideBar
        userList={userList}
        teamList={teamList}
        selectedTeam={selectedTeam}
        searchText={searchText}
        teamHash={teamHash}
        setSelectedTeam={setSelectedTeam}
        setSearchText={setSearchText}
        fetchUser={fetchUser}
        updateUser={updateUser}
      />
      <OrgTree
        userList={userList}
        teamHash={teamHash}
        updateUser={updateUser}
      />
    </div>
  );
}

export default App;
