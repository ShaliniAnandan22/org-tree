import {
  createServer,
  Model,
  hasMany,
  belongsTo,
  RestSerializer,
  Factory,
} from "miragejs";

export default function () {
  createServer({
    models: {
      team: Model.extend({
        users: hasMany(),
      }),

      user: Model.extend({
        team: belongsTo(),
      }),
    },
    factories: {
      user: Factory.extend({
        name: "",
        designation: "",
        team: null,
        manager: null,
      }),
      team: Factory.extend({ name: "" }),
    },
    seeds(server) {
      //Creating Static Team list
      let foundingTeam = server.create("team", { name: "Founder's Team" });
      server.create("team", { name: "Product Management" });
      server.create("team", { name: "Design" });
      server.create("team", { name: "DevOps" });
      server.create("team", { name: "Sales" });
      server.create("team", { name: "Marketing" });
      server.create("team", { name: "Development" });

      //Creating CEO
      server.create("user", {
        id: 1,
        name: "Mark Hill",
        designation: "CEO",
        team: null,
        manager: null,
      });

      server.create("user", {
        team: foundingTeam,
        name: "Linda May",
        designation: "Tech Lead",
        manager: "1",
      });
      server.create("user", {
        team: foundingTeam,
        name: "John Green",
        designation: "Marketing Lead",
        manager: "1",
      });
    },
    serializers: {
      user: RestSerializer,
    },
    routes() {
      this.get("/api/users", (schema, request) => {
        let { teamId, search } = request.queryParams;
        let userList = schema.users.all();

        if (teamId) {
          let teamUserList = schema.teams.find(teamId);
          userList = teamUserList.users;
        }
        if (search) {
          userList = userList.filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase())
          );
        }
        return userList;
      });
      this.post("/api/user", (schema, request) => {
        let userObj = JSON.parse(request.requestBody);
        let { id, team } = userObj;

        if (id) {
          return schema.users.find(id).update({ userObj });
        } else {
          let teamObj = schema.teams.find(team);
          return schema.users.create({ ...userObj, team: teamObj });
        }
      });
      this.get("/api/teams", (schema) => {
        return schema.teams.all();
      });
    },
  });
}
