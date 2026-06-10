import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
    token: {
        colorPrimary: '#6366f1',
        colorPrimaryHover: '#5558e8',
        colorPrimaryActive: '#4f46e5',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        Pagination: {
            colorPrimary: '#6366f1',
            colorPrimaryHover: '#5558e8',
            borderRadius: 8,
        },
        Input: {
            colorPrimary: '#6366f1',
            colorPrimaryHover: '#5558e8',
            borderRadius: 8,
        },
        Select: {
            colorPrimary: '#6366f1',
            colorPrimaryHover: '#5558e8',
            borderRadius: 8,
        },
        Collapse: {
            colorPrimary: '#6366f1',
            borderRadius: 8,
        },
    },
};

export default theme;
