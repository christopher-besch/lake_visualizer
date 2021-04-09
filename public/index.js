"use strict";
class Shape {
    constructor(ctx, x, y, color, alpha, border_color = "") {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = alpha;
        this.border_color = border_color;
    }
    get_color() {
        return this.color;
    }
    change_color(color) {
        this.color = color;
    }
    change_border_color(border_color) {
        this.border_color = border_color;
    }
    relocate(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Circle extends Shape {
    constructor(ctx, x, y, radius, color, alpha, border_color = "") {
        super(ctx, x, y, color, alpha, border_color);
        this.radius = radius;
    }
    draw() {
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color) {
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if (this.border_color) {
            this.ctx.strokeStyle = this.border_color;
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }
    is_hit(x, y) {
        let distance = Math.sqrt(Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2));
        return distance <= this.radius;
    }
}
class Rectangle extends Shape {
    constructor(ctx, x, y, width, height, color, alpha, border_color = "") {
        super(ctx, x, y, color, alpha, border_color);
        this.width = width;
        this.height = height;
    }
    draw() {
        this.ctx.globalAlpha = this.alpha;
        if (this.color) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.border_color) {
            this.ctx.strokeStyle = this.border_color;
            this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        this.ctx.globalAlpha = 1;
    }
    is_hit(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}
class Position {
    constructor(ctx, middle_x, middle_y, address, color, text_y_location_rel) {
        this.radius = 0;
        this.circumference = 0;
        this.icon_size = 0;
        this.text_y_location = 0;
        this.start_angle = 0;
        this.labels = false;
        // location of this element
        this.rotation = 0;
        this.x = 0;
        this.y = 0;
        this.ctx = ctx;
        this.middle_x = middle_x;
        this.middle_y = middle_y;
        this.address = address;
        this.color = color;
        this.text_y_location_rel = text_y_location_rel;
    }
    get_x() {
        return this.x;
    }
    get_y() {
        return this.y;
    }
    update(radius, icon_size, start_angle, circumference, labels) {
        this.radius = radius;
        this.circumference = circumference;
        this.icon_size = icon_size;
        this.text_y_location = this.text_y_location_rel * icon_size;
        this.start_angle = start_angle;
        this.labels = labels;
        let angle_per_address = (Math.PI * 2) / this.circumference;
        // angle of this position
        this.rotation = angle_per_address * this.address - this.start_angle;
        // location of this position
        this.x = this.middle_x + Math.cos(this.rotation) * this.radius;
        this.y = this.middle_y + Math.sin(this.rotation) * this.radius;
    }
    draw_label() {
        this.ctx.font = `${this.icon_size * 3}px Sans`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.address.toString(), 0, this.icon_size / 2);
    }
    // draw representation
    draw() {
        // draw with certain rotation in certain location
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        // up for draw_icon should be away from the circle
        this.ctx.rotate(this.rotation - Math.PI / 2);
        this.draw_icon();
        if (this.labels) {
            // further away from lake but horizontally rotated
            this.ctx.translate(0, this.text_y_location);
            this.ctx.rotate(-this.rotation + Math.PI / 2);
            this.draw_label();
        }
        this.ctx.restore();
    }
    change_color(color) {
        this.color = color;
    }
}
class TestIceCream extends Position {
    constructor(ctx, middle_x, middle_y, address) {
        super(ctx, middle_x, middle_y, address, "blue", -4);
    }
    draw_icon() {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.icon_size, -this.icon_size);
        this.ctx.lineTo(this.icon_size, this.icon_size);
        this.ctx.moveTo(-this.icon_size, this.icon_size);
        this.ctx.lineTo(this.icon_size, -this.icon_size);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.icon_size / 2;
        this.ctx.stroke();
    }
}
class CheckIceCream extends Position {
    constructor(ctx, middle_x, middle_y, address) {
        super(ctx, middle_x, middle_y, address, "blue", -4);
    }
    draw_icon() {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.icon_size, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.icon_size / 2;
        this.ctx.stroke();
    }
}
class House extends Position {
    constructor(ctx, middle_x, middle_y, address) {
        super(ctx, middle_x, middle_y, address, "black", 4);
    }
    draw_icon() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(-this.icon_size / 2, -this.icon_size, this.icon_size, this.icon_size * 2);
    }
}
class Lake {
    constructor(ctx, tools) {
        this.cursor_size = 0;
        this.radius = 0;
        // used to check if the addresses have been updated
        this.house_addresses = [];
        this.test_ices_addresses = [];
        this.check_ice_addresses = [];
        this.houses = [];
        this.test_ices = [];
        this.check_ices = [];
        this.ctx = ctx;
        this.tools = tools;
        this.x = ctx.canvas.width / 2;
        this.y = ctx.canvas.height / 2;
    }
    update(cursor_size, radius, icon_size, start_angle, circumference, house_labels, test_ice_label, check_ice_labels) {
        this.cursor_size = cursor_size;
        this.radius = radius;
        this.houses.forEach((position) => {
            position.update(radius, icon_size, start_angle, circumference, house_labels);
        });
        this.test_ices.forEach((position) => {
            position.update(radius, icon_size, start_angle, circumference, test_ice_label);
        });
        this.check_ices.forEach((position) => {
            position.update(radius, icon_size, start_angle, circumference, check_ice_labels);
        });
    }
    update_positions(house_addresses, test_ice_addresses, check_ice_addresses) {
        // overwrite if addresses have been updated
        if (JSON.stringify(house_addresses) !== JSON.stringify(this.house_addresses)) {
            this.houses = [];
            house_addresses.forEach((address) => {
                this.houses.push(new House(this.ctx, this.x, this.y, address));
            });
        }
        if (JSON.stringify(test_ice_addresses) !== JSON.stringify(this.test_ices_addresses)) {
            this.test_ices = [];
            test_ice_addresses.forEach((address) => {
                this.test_ices.push(new TestIceCream(this.ctx, this.x, this.y, address));
            });
        }
        if (JSON.stringify(check_ice_addresses) !== JSON.stringify(this.check_ice_addresses)) {
            this.check_ices = [];
            check_ice_addresses.forEach((address) => {
                this.check_ices.push(new CheckIceCream(this.ctx, this.x, this.y, address));
            });
        }
        this.house_addresses = house_addresses;
        this.test_ices_addresses = test_ice_addresses;
        this.check_ice_addresses = check_ice_addresses;
    }
    draw() {
        // draw lake
        this.ctx.beginPath();
        this.ctx.arc(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2, this.radius, 0, Math.PI * 2);
        // this.ctx.fillStyle = "#ffffff";
        // this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "0d0d0d";
        this.ctx.stroke();
        // draw objects
        this.houses.forEach((position) => {
            position.draw();
        });
        this.test_ices.forEach((position) => {
            position.draw();
        });
        this.check_ices.forEach((position) => {
            position.draw();
        });
    }
    // when the mouse is clicked inside the canvas and gets dragged
    on_mouse_drag(e) {
        let cursor = new Circle(this.ctx, e.offsetX, e.offsetY, this.cursor_size, this.tools.get_color(), 0.1);
        cursor.draw();
        this.houses.forEach((position) => {
            if (cursor.is_hit(position.get_x(), position.get_y()))
                position.change_color(this.tools.get_color());
        });
        this.draw();
    }
}
class Tools {
    constructor(ctx) {
        this.selected_color = "";
        this.ctx = ctx;
        // create rectangles for color pallette
        this.color_palette = [];
        let colors = ["red", "green", "orange", "blue", "black"];
        for (let i = 0; i < colors.length; ++i) {
            this.color_palette.push(new Rectangle(ctx, 20 + 50 * i, 20, 30, 30, colors[i], 1, "grey"));
            this.color_palette[i].draw();
        }
        // activate hit detection
        ctx.canvas.addEventListener("click", this.register_hit.bind(this));
        // preselect first color
        this.select_color(0);
    }
    get_color() {
        return this.selected_color;
    }
    select_color(color_idx) {
        this.selected_color = this.color_palette[color_idx].get_color();
        for (let i = 0; i < this.color_palette.length; ++i) {
            if (i === color_idx)
                this.color_palette[i].change_border_color("black");
            else
                this.color_palette[i].change_border_color("grey");
            this.color_palette[i].draw();
        }
    }
    register_hit(event) {
        for (let i = 0; i < this.color_palette.length; ++i)
            if (this.color_palette[i].is_hit(event.offsetX, event.offsetY)) {
                this.select_color(i);
                return;
            }
    }
}
// global variables
// tools
let tools_canvas = document.getElementById("tools-canvas");
let tools_ctx = tools_canvas.getContext("2d");
tools_canvas.width = tools_canvas.scrollWidth;
tools_canvas.height = tools_canvas.scrollHeight;
let tools = new Tools(tools_ctx);
// lake
let lake_canvas = document.getElementById("lake-canvas");
let lake_ctx = lake_canvas.getContext("2d");
lake_canvas.width = lake_canvas.scrollWidth;
lake_canvas.height = lake_canvas.scrollHeight;
let lake = new Lake(lake_ctx, tools);
// cursor
lake_canvas.addEventListener("mousedown", (down_event) => {
    function drag(e) {
        lake.on_mouse_drag(e);
    }
    function leave_drag(e) {
        lake_canvas.removeEventListener("mousemove", drag);
        render_lake();
    }
    // execute once
    drag(down_event);
    // add listener
    lake_canvas.addEventListener("mousemove", drag);
    // remove listener
    lake_canvas.addEventListener("mouseup", leave_drag);
    lake_canvas.addEventListener("mouseout", leave_drag);
});
function render_lake() {
    lake_ctx.clearRect(0, 0, lake_ctx.canvas.width, lake_ctx.canvas.height);
    lake.draw();
}
function update_settings() {
    // read form
    let lake_radius_raw = document.getElementById("lake-radius-form").value;
    let icon_size_raw = document.getElementById("icon-size-form").value;
    let start_angle_degree_raw = document.getElementById("start-angle-degree-form").value;
    let cursor_size_raw = document.getElementById("cursor-size-form").value;
    let circumference_raw = document.getElementById("circumference-form").value;
    let houses_raw = document.getElementById("houses-form").value;
    let test_ices_raw = document.getElementById("test-ices-form").value;
    let check_ices_raw = document.getElementById("check-ices-form").value;
    let houses_labels = document.getElementById("houses-labels-form").checked;
    let test_ice_labels = document.getElementById("test-ice-labels-form").checked;
    let check_ice_labels = document.getElementById("check-ice-labels-form").checked;
    // convert to int
    let radius = parseInt(lake_radius_raw);
    let icon_size = parseInt(icon_size_raw);
    let start_angle = (parseInt(start_angle_degree_raw) * Math.PI) / 180;
    let cursor_size = parseInt(cursor_size_raw);
    let circumference = parseInt(circumference_raw);
    // convert to int arrays
    let houses_str = !houses_raw ? [] : houses_raw.split(" ");
    let houses = [];
    for (let idx = 0; idx < houses_str.length; idx++) {
        let address = parseInt(houses_str[idx]);
        if (isNaN(address)) {
            alert("Invalid House Address!");
            return;
        }
        houses.push(address);
    }
    let test_ices_str = !test_ices_raw ? [] : test_ices_raw.split(" ");
    let test_ices = [];
    for (let idx = 0; idx < test_ices_str.length; idx++) {
        let address = parseInt(test_ices_str[idx]);
        if (isNaN(address)) {
            alert("Invalid Test Ice Address!");
            return;
        }
        test_ices.push(address);
    }
    let check_ices_str = !check_ices_raw ? [] : check_ices_raw.split(" ");
    let check_ices = [];
    for (let idx = 0; idx < check_ices_str.length; idx++) {
        let address = parseInt(check_ices_str[idx]);
        if (isNaN(address)) {
            alert("Invalid Check Ice Address!");
            return;
        }
        check_ices.push(address);
    }
    if (isNaN(radius) ||
        isNaN(icon_size) ||
        isNaN(start_angle) ||
        isNaN(cursor_size) ||
        isNaN(circumference) ||
        houses.length == 0) {
        alert("Invalid Input!");
        return;
    }
    lake.update_positions(houses, test_ices, check_ices);
    lake.update(cursor_size, radius, icon_size, start_angle, circumference, houses_labels, test_ice_labels, check_ice_labels);
    render_lake();
}
function download(open_in_new_tab = false) {
    let image_url = lake_canvas.toDataURL("lake.png");
    // create temporary link
    let tmp_link = document.createElement("a");
    if (open_in_new_tab)
        tmp_link.target = "_blank";
    else
        tmp_link.download = "lake.png";
    tmp_link.href = image_url;
    document.body.appendChild(tmp_link);
    tmp_link.click();
    document.body.removeChild(tmp_link);
}
//# sourceMappingURL=index.js.map