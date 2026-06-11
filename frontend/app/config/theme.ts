import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
    token: {
        colorPrimary: '#100f0e',
        colorPrimaryHover: '#2d2c2b',
        colorPrimaryActive: '#000000',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        Pagination: {
            colorPrimary: '#100f0e',
            colorPrimaryHover: '#2d2c2b',
            borderRadius: 8,
        },
        Input: {
            colorPrimary: '#100f0e',
            colorPrimaryHover: '#2d2c2b',
            borderRadius: 8,
        },
        Select: {
            colorPrimary: '#100f0e',
            colorPrimaryHover: '#2d2c2b',
            optionSelectedBg: '#ebebeb',
            borderRadius: 8,
        },
        Collapse: {
            colorPrimary: '#100f0e',
            borderRadius: 8,
            contentBg: '#fbfbfb',
        },
        Modal: {
            colorPrimary: '#100f0e',
            borderRadius: 8,
        },
        Button: {
            colorPrimary: '#100f0e',
            colorPrimaryHover: '#2d2c2b',
            borderRadius: 8,
        },
        Badge: {
            colorPrimary: '#100f0e',
        },
        Table: {
            borderColor: '#e5e7eb',
        },
    },
};

export default theme;
