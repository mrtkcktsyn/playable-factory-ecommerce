function mongooseCleanResponse(schema) {
  schema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;

      return ret;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      
      return ret;
    },
  });
}

module.exports = mongooseCleanResponse;