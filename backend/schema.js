const COMPONENT_WHITELIST = {
  layout: ["Container", "Row", "Column", "Sidebar", "Navbar"],
  components: [
    { name: "Navbar", props: ["title"] },
    { name: "Sidebar", props: ["title", "items"] },
    { name: "Button", props: ["label", "variant", "size"] },
    { name: "Card", props: ["title", "description"] },
    { name: "Input", props: ["placeholder", "label", "type"] },
    { name: "Table", props: ["headers", "dataRows"] },
    { name: "Chart", props: ["type", "data"] } 
  ]
};

module.exports = { COMPONENT_WHITELIST };