/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/07/2021
 * MODIFIED: 12/06/2021
 */

const { ObjectID } = require('mongodb');
const express = require('express');
const log = require('../../log');
const dbClient = require('../db-client');

require('promise.allsettled').shim();

const CACHE_LIFETIME = 60 // 1 min

//////
// HELPER FUNCTIONS:

let cachedMenuList;

async function getMenus() {

    // Retrieve from DB if expired
    if (cachedMenuList == null) {
        let menuList = [];
        const result = await dbClient.db('menu').collection('menus').find({});
        await result.forEach((doc) => {
            menuList.push({
                name: doc.name,
                menu: doc.menu
            });
        });
        cachedMenuList = menuList;
        setInterval(() => cachedMenuList = null, CACHE_LIFETIME * 1000);
        log.info(`Retrieved menu section list from DB (found: ${menuList.length})`);
    }

    // Return list
    return cachedMenuList;

}

let cachedMenuContents = {};

async function getMenuItems(menuName) {

    // Ensure a valid section name before query
    const menuList = await getMenus();
    if (menuList.find((x) => x.menu === menuName) == null) {
        return null;
    }

    // Retrieve from DB if expired
    if (cachedMenuContents[menuName] == null) {
        let itemList = [];
        const result = await dbClient.db('menu').collection('items').find({
            menu: menuName
        });
        await result.forEach((doc) => {
            itemList.push({
                id: doc._id.toHexString(),
                name: doc.name,
                calories: doc.calories,
                price: doc.price,
                qualities: doc.qualities,
                allergens: doc.allergens,
                section: doc.section
            });
        });
        cachedMenuContents[menuName] = itemList;
        setInterval(() => cachedMenuContents[menuName] = null, CACHE_LIFETIME * 1000);
        log.info(`Retrieved menu item list from DB (menu: ${menuName}, found: ${itemList.length})`);
    }

    // Return list
    return cachedMenuContents[menuName];

}

let cachedMenuOptions = {};

async function getMenuOptions(name) {

    // Retrieve from DB if expired
    if (cachedMenuOptions[name] == null) {
        let optionList = [];
        const result = await dbClient.db('menu').collection('options').find({
            option: name
        });
        await result.forEach((doc) => {
            optionList.push({
                id: doc._id.toHexString(),
                name: doc.name,
                calories: doc.calories,
                price: doc.price,
                qualities: doc.qualities,
                allergens: doc.allergens,
                options: doc.options
            });
        });
        cachedMenuOptions[name] = optionList;
        setInterval(() => cachedMenuOptions[name] = null, CACHE_LIFETIME * 1000);
        log.info(`Retrieved menu option list from DB (option: ${name}, found: ${optionList.length})`);
    }

    // Return list
    return cachedMenuOptions[name];

}

let cachedItemDetails = {};

async function getItemDetails(itemID) {

    // Retrieve from DB if expired
    if (cachedItemDetails[itemID] == null) {
        const item = await dbClient.db('menu').collection('items').findOne({
            _id: new ObjectID(itemID)
        });
        if (item != null) {
            cachedItemDetails[itemID] = {
                id: item._id.toHexString(),
                name: item.name,
                calories: item.calories,
                price: item.price,
                qualities: item.qualities,
                allergens: item.allergens,
                options: item.options
            };
        } else {
            cachedItemDetails[itemID] = "null";
        }
        setInterval(() => cachedItemDetails[itemID] = null, CACHE_LIFETIME * 1000);
        log.info(`Retrieved menu item from DB (id: ${itemID}, found: ${item != null ? 'yes' : 'no'})`);
    }

    // Return details
    let item = cachedItemDetails[itemID];
    return item != "null" ? item : null;

}

//////
// ROUTE DEFINITIONS:

const router = express.Router();
const onServer = false; //process.platform == 'linux';

if (onServer) {
    router.get('/', async(req, res) => {

        // Wrap in try-catch
        try {

            // Send list of valid menus
            res.status(200).send({
                sections: await getMenus()
            });

        } catch (err) {
            log.error(`Failed to get menu section list: ${err}`);
            res.status(500).send({ error: 'Internal server error' });
        }

    });
} else {
    router.get('/', async(req, res) => {

        // Send static list of menus
        res.status(200).send({
            sections: [{
                    name: "Breakfast",
                    menu: "breakfast"
                },
                {
                    name: "Daily",
                    menu: "daily"
                },
                {
                    name: "Bakery",
                    menu: "bakery"
                }
            ]
        });

    });
}

if (onServer) {
    router.get('/:menuName', async(req, res) => {

        // Wrap in try-catch
        try {

            // Validate name
            const menuContents = await getMenuItems(req.params.menuName);
            if (menuContents == null) {
                res.status(400).send({ error: `"${req.params.menuName}" is not a valid menu name` });
                return;
            }

            // Return menu
            res.status(200).send({
                menu: req.params.menuName,
                items: menuContents
            });

        } catch (err) {
            log.error(`Failed to get menu item list: ${err}`);
            res.status(500).send({ error: 'Internal server error' });
        }

    });
} else {
    const ITEMS = require('./static/items.json');
    router.get('/:menuName', async(req, res) => {

        // Collect items with a matching name and send
        let items = [];
        ITEMS.forEach((item) => {
            if (item.menu == req.params.menuName) {
                items.push(item);
            }
        });

        // Return menu
        res.status(200).send({
            menu: req.params.menuName,
            items: items
        });

    });
}

if (onServer) {
    router.get('/options/:name', async(req, res) => {

        // Wrap in try-catch
        try {

            // Validate name
            const optionList = await getMenuOptions(req.params.name);
            if (optionList == null) {
                res.status(400).send({ error: `"${req.params.name}" is not a valid menu option` });
                return;
            }

            // Return menu
            res.status(200).send({
                option: req.params.name,
                items: optionList
            });

        } catch (err) {
            log.error(`Failed to get menu options list: ${err}`);
            res.status(500).send({ error: 'Internal server error' });
        }

    });
} else {}

if (onServer) {
    router.post('/itemDetails', async(req, res) => {

        // Wrap in try-catch
        try {

            // Retrieve each item
            let itemList = {};
            let promises = [];
            req.body.forEach((itemID) => {
                promises.push(getItemDetails(itemID)
                    .then((item) => {
                        itemList[itemID] = item;
                    })
                );
            });
            await Promise.allSettled(promises);

            // Return details
            res.status(200).send({
                items: itemList
            });

        } catch (err) {
            log.error(`Failed to get menu item details list: ${err}`);
            res.status(500).send({ error: 'Internal server error' });
        }

    });
} else {
    const ITEMS = require('./static/items.json');
    router.post('/itemDetails', async(req, res) => {

        // Retrieve each item
        let itemList = {};
        req.body.forEach((itemID) => {
            let found = false;
            ITEMS.forEach((item) => {
                if (item.id == itemID) {
                    itemList[itemID] = item;
                    found = true;
                }
            });
            if (!found) {
                itemList[itemID] = null;
            }
        });

        // Return details
        res.status(200).send({
            items: itemList
        });

    });
}

module.exports = router;