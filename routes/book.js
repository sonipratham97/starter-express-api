const db = require("../db/book");
const multer = require("multer")();
const auth = require("../middleware/auth");
const database = require("../db/login")
module.exports = function (router) {
  //books uploud book image api is panding
  router.post("/bookinfo", multer.any(), auth, async (req, res) => {
    try {
      const data = {
        userid: req.decoded.userid,
        title: req.body.title,
        author: req.body.author,
        genre: req.body.gener,
        description: req.body.description,
        bookurl:req.body.bookurl
      };

      const datas = await db(data);
      await datas.save();
      res
        .status(200)
        .json({ success: true, message: "book info submited successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "something went wrong" });
    }
  });

  //books on home page
  router.get("/booksget", async (req, res) => {
    try {
      const data = await db.find();
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  //user books
  router.get("/userbooks/:userid", auth, async (req, res) => {
    try {
      console.log(req.params);
      const data = await db.find({ userid: req.params.userid });
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  //click to open book
  router.get("/bookget/:id", auth, async (req, res) => {
    try {
      const data = await db.findById(req.params.id);
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  router.delete("/bookdelete/:_id",auth, async (req, res) => {
    try {
      const cardatas = await db.findByIdAndDelete(req.params._id);
      res
        .status(200)
        .json({ success: true, message: "Book successfully Deleted!" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  router.put("/bookupdate/:_id",auth, async (req, res) => {
    try {
      let update = await db.findByIdAndUpdate(req.params._id, {
        $set: req.body,
      });
      res
        .status(200)
        .json({ success: true, message: "Book successfully updated!" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });

  //search book by title , genre
  router.get("/search/:search", auth, async (req, res) => {
    try {
      let search = req.params.search;
      let users = await db.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
          // { "price": { $regex: search, $options: "i" } }
        ],
      });
      // const reversedata = users.reverse();
      res.json({ success: true, data: users });
    } catch (error) {
      res.json({ success: false, message: "something went wrong" });
      console.log(error);
    }
  });
  
  router.post("/inbox",auth,multer.any(),async(req,res)=>{
var userid=req.decoded.userid
console.log(userid);
var bookid=req.body.bookid
var bookownerid=req.body.bookownerid
try {

var inboxitem={
  bookid:bookid,
  userid:userid
}

  const user = await database.findById(bookownerid);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.inbox.some(item => JSON.stringify(item) === JSON.stringify(inboxitem))) {
    return res.status(400).json({ message: 'your message already sent' });
  }
  user.inbox.push(inboxitem);

  // Save the updated user document
  await user.save();
  res.status(200).json({ success: true, data: user,message:"Your message successefully sent" });
} catch (error) {
  console.log(error);
  res
    .status(500)
    .json({ success: false, message: "Internal server error" });
}
  })


  router.delete('/inbox/:bookownerid',multer.any(), async (req, res) => {
    try {
      const { bookownerid } = req.params;
      const { bookid, userId } = req.body;
  
      const user = await database.findById(bookownerid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Use $pull to remove the item with matching bookid and bookownerid
      user.inbox.pull({ bookid: bookid, userId: userId });
  
      // Save the updated user document
      await user.save();
  
      res.status(200).json({ success: true, data: user, message: 'Item removed from inbox' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  })
  return router;



};
