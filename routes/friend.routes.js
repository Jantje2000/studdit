const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver').v1;
const mongoose = require("../db/mongoose");
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Test123$'));

router.post('/', (req, res) => {
    const session = driver.session();

    friend1 = req.body.friend1;
    friend2 = req.body.friend2;

    mongoose.User.where({username: req.body.friend1}).countDocuments((err, count) => {
        if(count !== 0){
            mongoose.User.where({username: req.body.friend2}).countDocuments((err, count) => {
                if(count !== 0){
                    session.run('MATCH (n:Person { name: $friend1 }) return n', {friend1: friend1})
                        .then((returnedFriend1) => { // check if friend 1 already is in database
                            if (returnedFriend1.records.length === 0) {
                                session.run('CREATE (a:Person {name: $name}) RETURN a', {name: friend1});
                            }
                        })
                        .then(() => {
                            session.run('MATCH (n:Person { name: $friend2 }) return n', {friend2: friend2}).then((returnedFriend2) => {
                                if (returnedFriend2.records.length === 0) {
                                    session.run('CREATE (a:Person {name: $name}) RETURN a;', {name: friend2});
                                }
                            }).then(() => {
                                session.run('MATCH (:Person {name: $friend1})-[r:friend]-(:Person {name: $friend2}) return r', {friend1: friend1, friend2: friend2}).then((result) => {
                                    if(result.records.length === 0){
                                        session.run('MATCH (a:Person),(b:Person) ' +
                                            'WHERE a.name = $friend1 AND b.name = $friend2 ' +
                                            'CREATE (a)-[r:friend]->(b)\n', {friend1: friend1, friend2: friend2}).then(() => {
                                            session.close();
                                        });
                                    }
                                });
                            })
                        })
                        .then(() => {
                            res.status(200).send();
                        });

                }else{
                    res.status(424).send();
                }
            });
        }else{
            res.status(424).send();
        }

    });
});

router.delete('/', (req, res) => {
    const session = driver.session();

    friend1 = req.body.friend1;
    friend2 = req.body.friend2;

    session.run('MATCH (:Person {name: $friend1})-[r:friend]-(:Person {name: $friend2}) DELETE r', {friend1: friend1, friend2: friend2})
        .then(() => {
            session.close();
        }).then(() => {
        res.status(200).send();
    });

});

module.exports = router;