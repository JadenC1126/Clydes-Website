import { parseJsonObj } from '../menu_breakfast/parse_menu';
import bakery_list from './bakery_list.js'


test("Bakery Menu Parser Test", () => {
    let arrobj = [];
    for (let i=0; i < 17; i++){
        arrobj.push(bakery_list[i+1]);
    }
    let bakeryList = parseJsonObj(arrobj);

    // Name attribute test
    expect(bakeryList['Bagels'][0].name).toBe('Parmesan Herb Bagel');
    expect(bakeryList['Muffins, Breads, and Pastries'][0].name).toBe('Blueberry Muffin');
    // Calorie attribute test
    expect(bakeryList['Cookies, Bars, and Desserts'][1].calories).toBe(503);
    expect(bakeryList['Muffins, Breads, and Pastries'][4].calories).toBe(568);
    // Price attribute test
    expect(bakeryList['Cookies, Bars, and Desserts'][3].price).toBe(399);
    expect(bakeryList['Bagels'][0].price).toBe(599);
});