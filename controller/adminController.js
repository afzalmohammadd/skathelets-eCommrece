const adminhelper = require("../helpers/adminhelper");
const user = require("../models/userModel");
const userController = require('../controller/userController')
const email = "admin@gmail.com";
const password = "123";
const categories = require('../models/categoryModel')
const products = require('../models/productModel')

module.exports = {
  adminLogin: async (req, res) => {
    try {
      res.render("admin/admin-login", {
        layout: "layouts/adminLayout",
        admin: true,
      });
    } catch (error) {
      res.status(500);
      console.log(error);
    }
  },
  loginPost: (req, res) => {
    console.log("=====+++=====");
    if (req.body.email === email && req.body.password === password) {
      req.session.admin = true
      console.log("------------");
      res.redirect('/admin')
    } else {
      res.redirect('/admin')
    }

  },
  adminHome: (req, res) => {
    try {
      res.render("admin/admin-home", { layout: "layouts/adminLayout", admin: false });
    } catch {
      res.status(500)
    }
  },
  userList: async (req, res) => {
    await adminhelper.findUsers().then((response) => {
      res.status(200).render("admin/users-list", {
        layout: "layouts/adminLayout",
        users: response,
      })
    }).catch((error) => {
      console.log("errrooorrrrr")
      console.log(error);;
    })
  },
  getblockUser: (req, res) => {
    try {
      console.log(req.params.id);
      adminhelper.
        blockUser(req.params.id)
        .then((response) => {
          console.log(response);
          res.redirect("/admin/users-List")
        })
        .catch((error) => {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  },
  getUnblockUser: (req, res) => {
    try {
      adminhelper.Unblock(req.params.id)
        .then((response) => {
          res.redirect("/admin/users-List")
        })
        .catch((error) => {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  },



  // CATEGORY MANAGEMENT
  getCategory: async (req, res) => {
    try {
      if (req.session.admin) {
        const viewCategory = await adminhelper.getAllcategory()
        console.log("hi i'm category" + viewCategory);

        res.render("admin/categories", {
          layout: "layouts/adminLayout",
          viewCategory
        })

      } else {
        res.render("admin/admin-login", {
          layout: "layouts/adminLayout",
          admin: true
        })
      }
    } catch (error) {
      console.log(error);
    }
  },
  addCategory: async (req, res) => {
    let catName = req.body.CategoryName
    let catDis = req.body.CategoryDescription
    try {

      await adminhelper.addingCategories(catName, catDis).then((response) => {
        console.log(response)
        res.redirect("/admin/getCategories")
      })
    } catch (error) {
      console.log(error)
    }
  },
  deleteCategories: async (req, res) => {
    let response = {}
    let deletingid = req.params.id;
    let Product = await products.findOne({ prodCategory: deletingid });
    let viewCategory =  await categories.find({})
    try {

      if (!Product) {
        const result = await categories.findByIdAndDelete(deletingid)
        console.log(result);
        console.log("category deleted successfully");
      } else {
        console.log("can't delete ,using in an existing product");
        response.existing
        res.render('admin/categories', {
          layout: "layouts/adminLayout",
          existing: true,
          viewCategory

        })

      }
    } catch (error) {
      console.log(error);
    }
  },

  // PRODUCT MANAGEMENT
  getProducts: (req, res) => {
    // console.log('inprod**********');
    adminhelper.getAllProducts().then((result) => {
      console.log(result);
      res.render('admin/admin-productList', {
        layout: "layouts/adminLayout",
        result

      })
    })
  },
  addProdget: async (req, res) => {
    let viewCategory = await categories.find({})
    try {
      if (req.session.admin) {
        res.render('admin/addproduct', {
          layout: "layouts/adminLayout",
          viewCategory

        })
      } else {
        res.render("admin/admin-login", {
          layout: "layouts/adminLayout",
          admin: true
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
  addProduct: async (req, res) => {
    let datas = req.body
    let files = req.files
    console.log(req.file);
    console.log(req.body);

    try {
      await adminhelper.addProduct(datas,files).then((response) => {
        console.log(response)
        res.redirect("/admin/addproduct")
      })
    } catch (error) {
      console.log(error.message);
    }
  },
  geteditProduct: async (req, res) => {
    try {
      console.log("editing product")
      let product = await products.findById({ _id: req.params.id })
      console.log(product)
      let viewCategory = await categories.find({})
      console.log(viewCategory)

      if (product) {
        res.render('admin/editProduct', {
          layout: "layouts/adminLayout",
          product: product,
          viewCategory: viewCategory
        })
      } else {
        res.render("admin/admin-login", {
          layout: "layouts/adminLayout",
          admin: true
        })

      }
    } catch (error) {
      console.log(error);
    }

  },
  editproduct: async (req, res) => {

    let body = req.body
    let proId = req.params.id
    let image = req.file
    console.log(req.file, "IMAGEEEEEEEEEEE");
    const updatedProduct = await adminhelper.PostEditProduct(body, proId, image)
    res.redirect("/admin/getProducts")

  },
  unlistProduct: async (req, res) => {
    let deletingId = req.params.id;
    console.log(deletingId);

    try {
      await products.updateOne(
        { _id: deletingId },
        { $set: { unList: true } }
      );
      console.log("Product unlisted successfully.");
      res.redirect("/admin/getProducts");
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while unlisting the product.");
    }
  },
  listProduct: async (req, res) => {
    let deletingId = req.params.id;
    console.log(deletingId);

    try {
      await products.updateOne(
        { _id: deletingId },
        { $set: { unList: false } }
      );
      console.log("Product listed successfully.");
      res.redirect("/admin/getProducts");
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while listing the product.");
    }
  }


}
