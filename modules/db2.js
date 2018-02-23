const knex = require("knex")({
    client: "mysql",
    connection: {
        user: "root",
        password: "nSPemHJ5Hc",
        database: "gamesdb",
    },
});

module.exports.getBasicData = async (id) => {
    try {
        const data = await knex.select().from("app").where("steam_id", id);
        return data;
    } catch (err) {
        console.error(err);
    }
};

module.exports.getDevOrPub = async (id, devOrPub) => {
    // Check if 'devOrPub' is valid
    if (devOrPub !== "developer" && devOrPub !== "publisher") {
        return console.error(new Error("devOrPub must be either 'developer' or 'publisher'"));
    }

    try {
        const companyId = await knex.select().from(devOrPub).where("app_steam_id", id);
        const data = await knex.select("name").from("company").where("company_id", companyId);
        console.log(data);
    } catch (err) {
        console.error(err);
    }
};
