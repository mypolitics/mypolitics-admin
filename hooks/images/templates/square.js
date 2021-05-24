module.exports = `
<div style="
    margin: 0;
    width: 900px;
    height: 900px;
    overflow: hidden;
    position: relative;
">
    <img src="{{src}}" style="
        position: absolute;
        height: 900px;
        width: 900px;
        object-fit: cover;
        filter: blur(32px);
        transform: scale(1.1);
    "><div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
    "></div>
    <img src="{{src}}" style="
        z-index: 1;
        width: 900px;
        height: auto;
        max-height: 900px;
        object-fit: contain;
        display: block;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    ">
</div>
`;
