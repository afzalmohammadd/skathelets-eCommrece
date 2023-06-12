const adminhelper = require("../helpers/adminhelper");
const user = require("../models/userModel");
const userController = require('../controller/userController')
const email = "admin@gmail.com";
const password = "123";
const categories = require('../models/categoryModel')
const products = require('../models/productModel')
const orderhelper = require("../helpers/orderhelper")
const coupenHelper = require("../helpers/coupenHelper")
const orders = require('../models/orderModel')
const excelJs = require('exceljs')

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
  adminHome: async (req, res) => {
    try {
      const revenue = await orders.aggregate([{ $match: { orderStatus: "delivered" } }, { $group: { _id: "null", total: { $sum: "$totalAmount" } } }]);
      const ordercountAggregation = await orders.aggregate([{ $match: { orderStatus: "delivered" } }, { $count: "ordercount" }])
      const ordercount = ordercountAggregation[0]?.ordercount || 0
      const productsCount = await products.find({}).count()
      const categoriesCount = await categories.find({}).count()
      const userCount = await user.find({}).count()
      // let orders = await orderhelper.getAllOrders()
      console.log(orders);
      res.render("admin/admin-home", {
        layout: "layouts/adminLayout",
        admin: false,
        revenue: revenue[0].total,
        ordercount: ordercount,
        products: productsCount,           
        categories: categoriesCount,
        user: userCount,
        // orders   
      })
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }

  },

  chart:async(req,res)=>{
    try{
  
      const salesData = await orders.aggregate([{ $match: { orderStatus: 'delivered' } },{ $group: {_id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },totalRevenue: { $sum: '$totalAmount' }}},{ $sort: { _id: 1 } }])
      console.log(salesData)
      res.send({message:"success",salesData:salesData})
    }catch(error){
23000
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
      console.log(req.params.id)
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
    let viewCategory = await categories.find({})
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
      await adminhelper.addProduct(datas, files).then((response) => {
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
  },
  listOrder: async (req, res) => {
    try {
      let orders = await orderhelper.getAllOrders(); // Missing parentheses after getAllOrders()

      res.render("admin/orderList", {
        layout: "layouts/adminLayout",
        orders: orders,
      });
    } catch (error) {
      console.log(error);
    }
  },
  changeProductOrderStatus: async (req, res) => {
    try {
      let Changestatus = req.body.status
      let orderId = req.body.orderId

      let OrderStatus = await orderhelper.changeOrderStatus(Changestatus, orderId)
      res.status(202).json(OrderStatus)
    } catch (error) {
      console.log(error);
    }
  },
  excelSalesdata: async (req, res) => {
    try {
      const workbook = new excelJs.Workbook();
      const worksheet = workbook.addWorksheet("Sale Data")
      const revenue = await orders.aggregate([{ $match: { orderStatus: "delivered" } }, { $group: { _id: "null", total: { $sum: "$totalAmount" } } }]);
      const ordercountAggregation = await orders.aggregate([{ $match: { orderStatus: "delivered" } }, { $count: "ordercount" }])
      const ordercount = ordercountAggregation[0]?.ordercount || 0
      const productsCount = await products.find({}).count()
      const categoriesCount = await categories.find({}).count()
      const userCount = await user.find({}).count()

      worksheet.addRow(['Total Revenue', revenue[0].total])
      worksheet.addRow(['Order Count', ordercount])
      worksheet.addRow(['User Count', userCount])
      worksheet.addRow(['Product Count', productsCount])
      worksheet.addRow(['Categories Count', categoriesCount])

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=saledata.xlsx")

      return workbook.xlsx.write(res)
        .then(() => {
          res.status(200).end()
        })
        .catch(error => {
          console.log(error)
          res.status(500).end()
        })
    } catch (error) {
      console.log(error);
    }
  },
  Salesdata: async (req, res) => {
    try {
      const sales = await orderhelper.getAllDeliveredOrders();
      console.log("inside salesDataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      console.log("sales", sales);
      res.render("admin/salesReport", {
        layout: "layouts/adminLayout",
        sales: sales  // Pass the sales data to the template for rendering
      });
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
    }
  },
  salesReportDate: async (req, res) => {
    try {
      console.log("Inside salesReportDate");
  
      let { startDate, endDate } = req.body;
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
  
      startDate = new Date(startDate);
      endDate = new Date(endDate);
  
      console.log("Formatted startDate:", startDate);
      console.log("Formatted endDate:", endDate);
  
      const salesReport = await orderhelper.getDeliveredOrdersbyDate(startDate, endDate);
      console.log("Sales Report:", salesReport);
  
      // for (let i = 0; i < salesReport.length; i++) {
      //   salesReport[i].orderDate = dateFormat(salesReport[i].orderDate);
      //   salesReport[i].totalAmount = currencyFormat(salesReport[i].totalAmount);
      // }
  
      console.log("Formatted Sales Report:", salesReport);
  
      res.status(200).json({ sales: salesReport });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  ,
  
  // dateFormat:(date)=>{
  //   return new Date(date).toISOString().slice(0, 10);
  // },
  // currencyFormat:(amount)=>{
  //   return Number(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  // }
   
  coupons:async(req,res)=>{
    try{
      let allCoupons = await coupenHelper.getAllCoupons()

      res.render("admin/coupon",{ coupons: allCoupons, layout: "layouts/adminLayout" })

      
    }catch(error){

    }
  },

  postAddCoupon:async(req,res)=>{
    try{
      coupenHelper.addCouponToDB(req.body)
      .then((coupon)=>{
        res.status(202).redirect('/admin/coupon')
      })
      .catch((error)=>{
        console.log(error);
      })
    }catch(error){

    }
  },

  productOrderDetailsAdmin: async (req, res) => {
    try {
        const orderId = req.params.id
        let orderdetails = await orderhelper.getOrderedUserDetailsAndAddress(orderId); //got user details

        let productDetails = await orderhelper.getOrderedProductsDetails(orderId); //got ordered products details

        console.log("inside productOrderDetails");
        
        
        res.render('admin/order-details-admin', {
            layout: "layouts/adminLayout",
            orderdetails, productDetails
        })
    } catch (error) {

    }
},

orderCancel:async(req,res) =>{

  const userId = req.body.userId;
  const orderId = req.body.orderId;

  try{
      const cancelled = await orderhelper.cancelorder(orderId)
      res.status(200).json({ isCancelled: true, message: "order canceled successfully" })
  }catch(error){
      console.log(error);
  }
},

orderReturn:async(req,res) =>{
  const userId = req.body.userId
  const orderId = req.body.orderId

  try{
      const returnOrder = await orderhelper.orderReturn(userId,orderId)
      res.status(200).json({isreturned: 'return pending', message:"user is returning the order"})
  }catch(error){
      console.log(error);
  }
}


}
