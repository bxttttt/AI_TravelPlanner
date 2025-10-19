// 测试高德地图API Key是否有效
const https = require('https');

const apiKey = 'bcc1de3faa5eba739163b06b76138200';

// 测试地理编码API
function testGeocodingAPI() {
    return new Promise((resolve, reject) => {
        const address = encodeURIComponent('北京市天安门');
        const url = `https://restapi.amap.com/v3/geocode/geo?key=${apiKey}&address=${address}`;
        
        console.log('🔍 测试高德地图地理编码API...');
        console.log('📡 请求URL:', url);
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('📊 API响应状态:', result.status);
                    console.log('📊 API响应信息:', result.info);
                    
                    if (result.status === '1' && result.geocodes && result.geocodes.length > 0) {
                        console.log('✅ 高德地图API Key有效');
                        console.log('📍 地理编码结果:', result.geocodes[0]);
                        resolve(true);
                    } else {
                        console.log('❌ 高德地图API Key无效或请求失败');
                        console.log('📋 错误信息:', result.info);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ 解析API响应失败:', error.message);
                    resolve(false);
                }
            });
        }).on('error', (error) => {
            console.log('❌ API请求失败:', error.message);
            resolve(false);
        });
    });
}

// 测试路径规划API
function testRoutePlanningAPI() {
    return new Promise((resolve, reject) => {
        const origin = '116.397428,39.90923'; // 北京天安门
        const destination = '121.473701,31.230416'; // 上海外滩
        const url = `https://restapi.amap.com/v3/direction/driving?key=${apiKey}&origin=${origin}&destination=${destination}`;
        
        console.log('🛣️ 测试高德地图路径规划API...');
        console.log('📡 请求URL:', url);
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('📊 API响应状态:', result.status);
                    console.log('📊 API响应信息:', result.info);
                    
                    if (result.status === '1' && result.route && result.route.paths && result.route.paths.length > 0) {
                        console.log('✅ 路径规划API测试成功');
                        const path = result.route.paths[0];
                        console.log('📏 路线距离:', path.distance, '米');
                        console.log('⏱️ 预计时间:', Math.round(path.duration / 60), '分钟');
                        resolve(true);
                    } else {
                        console.log('❌ 路径规划API测试失败');
                        console.log('📋 错误信息:', result.info);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ 解析API响应失败:', error.message);
                    resolve(false);
                }
            });
        }).on('error', (error) => {
            console.log('❌ API请求失败:', error.message);
            resolve(false);
        });
    });
}

// 运行测试
async function runTests() {
    console.log('🚀 开始测试高德地图API...\n');
    
    const geocodingResult = await testGeocodingAPI();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const routeResult = await testRoutePlanningAPI();
    console.log('\n' + '='.repeat(50) + '\n');
    
    if (geocodingResult && routeResult) {
        console.log('🎉 所有测试通过！高德地图API Key完全可用！');
    } else {
        console.log('⚠️ 部分测试失败，请检查API Key配置');
    }
}

runTests().catch(console.error);
