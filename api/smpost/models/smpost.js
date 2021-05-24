'use strict';

const onChange = async (data) => {
    if (!data.image) {
        return;
    }

    const { height, width, url: src } = await strapi.query('plugins::upload.file').findOne({ _id: data.image });
    const notSquare = (width / height) !== 1;

    if (notSquare) {
        const { image } = await strapi.services.getImage({
            templateName: 'square',
            content: { src }
        })

        data.image = image;
    }
}

module.exports = {
    lifecycles: {
        beforeCreate: onChange,
        beforeUpdate: async (_, data) => await onChange(data),
    }
};
