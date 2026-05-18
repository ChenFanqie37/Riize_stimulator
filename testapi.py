import os
import requests
import json
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env = load_env()

API_KEYS = []
i = 1
while True:
    key = env.get(f'VITE_API_KEY_{i}') or os.environ.get(f'VITE_API_KEY_{i}')
    if not key:
        break
    API_KEYS.append({'name': f'APIkey{i}', 'key': key})
    i += 1

BASE_URL = env.get('VITE_API_BASE_URL') or os.environ.get('VITE_API_BASE_URL', 'https://api.deepseek.com')
MODEL = env.get('VITE_API_MODEL') or os.environ.get('VITE_API_MODEL', 'deepseek-chat')

TEST_PROMPT = 'Say "Hello" in Korean. Reply with only the Korean word.'

def test_api_key(key_info, index):
    key = key_info['key']
    key_name = key_info['name']
    key_preview = f"{key[:8]}...{key[-4:]}"
    url = f"{BASE_URL}/chat/completions"
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": TEST_PROMPT}
        ],
        "temperature": 0.1,
        "max_tokens": 50
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}"
    }

    try:
        start = time.time()
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        elapsed = time.time() - start

        if response.status_code == 200:
            data = response.json()
            text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            usage = data.get('usage', {})
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'SUCCESS',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': text.strip()[:80],
                'usage': f"prompt:{usage.get('prompt_tokens','?')} completion:{usage.get('completion_tokens','?')} total:{usage.get('total_tokens','?')}"
            }
        elif response.status_code == 402:
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'INSUFFICIENT_BALANCE',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': '账户余额不足，请充值后重试',
                'usage': '-'
            }
        elif response.status_code == 429:
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'RATE_LIMITED',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': '请求频率超限，请稍后重试',
                'usage': '-'
            }
        elif response.status_code == 401:
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'UNAUTHORIZED',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': 'API密钥无效或已过期',
                'usage': '-'
            }
        elif response.status_code == 403:
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'FORBIDDEN',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': '无权限访问此模型',
                'usage': '-'
            }
        else:
            error_msg = ''
            try:
                error_msg = response.json().get('error', {}).get('message', '')[:80]
            except:
                error_msg = f'HTTP {response.status_code}'
            return {
                'index': index + 1,
                'name': key_name,
                'key_preview': key_preview,
                'status': 'FAILED',
                'http_code': response.status_code,
                'latency': f"{elapsed:.2f}s",
                'response': error_msg,
                'usage': '-'
            }
    except requests.exceptions.Timeout:
        return {
            'index': index + 1,
            'name': key_name,
            'key_preview': key_preview,
            'status': 'TIMEOUT',
            'http_code': 'N/A',
            'latency': '>30s',
            'response': '请求超时（30秒）',
            'usage': '-'
        }
    except requests.exceptions.ConnectionError:
        return {
            'index': index + 1,
            'name': key_name,
            'key_preview': key_preview,
            'status': 'CONNECTION_ERROR',
            'http_code': 'N/A',
            'latency': 'N/A',
            'response': '无法连接到服务器，请检查网络',
            'usage': '-'
        }
    except Exception as e:
        return {
            'index': index + 1,
            'name': key_name,
            'key_preview': key_preview,
            'status': 'ERROR',
            'http_code': 'N/A',
            'latency': 'N/A',
            'response': str(e)[:80],
            'usage': '-'
        }

def main():
    print("=" * 70)
    print("  韩娱嫂嫂模拟器 · LLM API 密钥测试工具")
    print("=" * 70)
    print(f"\n  测试端点: {BASE_URL}/chat/completions")
    print(f"  测试模型: {MODEL}")
    print(f"  密钥数量: {len(API_KEYS)}")
    print(f"  配置来源: .env 文件")
    print(f"  测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

    if len(API_KEYS) == 0:
        print("  [ERROR] 未找到API密钥！")
        print("  请在项目根目录创建 .env 文件，参考 .env.example 模板\n")
        return 1

    print("-" * 70)

    results = []
    success_count = 0
    fail_count = 0

    for i, key_info in enumerate(API_KEYS):
        print(f"\n  [测试 {i+1}/{len(API_KEYS)}] {key_info['name']} ({key_info['key'][:8]}...{key_info['key'][-4:]})")
        result = test_api_key(key_info, i)
        results.append(result)

        status_icon = "[OK]" if result['status'] == 'SUCCESS' else "[FAIL]"
        print(f"  {status_icon} 状态: {result['status']}")
        print(f"       HTTP: {result['http_code']}  延迟: {result['latency']}")
        if result['status'] == 'SUCCESS':
            print(f"       回复: {result['response']}")
            print(f"       用量: {result['usage']}")
            success_count += 1
        else:
            print(f"       原因: {result['response']}")
            fail_count += 1

        if i < len(API_KEYS) - 1:
            time.sleep(1)

    print("\n" + "=" * 70)
    print("  测试结果汇总")
    print("=" * 70)

    print(f"\n  {'序号':<4} {'名称':<10} {'密钥':<16} {'状态':<20} {'HTTP':<6} {'延迟':<8}")
    print("  " + "-" * 64)

    for r in results:
        status_icon = "[OK]" if r['status'] == 'SUCCESS' else "[FAIL]"
        print(f"  {r['index']:<4} {r['name']:<10} {r['key_preview']:<16} {status_icon} {r['status']:<16} {str(r['http_code']):<6} {r['latency']:<8}")

    print(f"\n  总计: {len(API_KEYS)} 个密钥")
    print(f"  成功: {success_count} 个")
    print(f"  失败: {fail_count} 个")

    if success_count > 0:
        print(f"\n  可用密钥: {', '.join([r['name'] for r in results if r['status'] == 'SUCCESS'])}")
    if fail_count > 0:
        print(f"  失败密钥: {', '.join([r['name'] for r in results if r['status'] != 'SUCCESS'])}")

    avg_latency = 0
    success_results = [r for r in results if r['status'] == 'SUCCESS']
    if success_results:
        latencies = [float(r['latency'].replace('s', '')) for r in success_results]
        avg_latency = sum(latencies) / len(latencies)
        print(f"\n  平均延迟: {avg_latency:.2f}s (成功密钥)")

    print("\n" + "=" * 70)

    if success_count == 0:
        print("\n  [WARNING] 所有API密钥均不可用！请检查：")
        print("     1. .env 文件中的密钥是否正确")
        print("     2. 账户余额是否充足")
        print("     3. 网络连接是否正常")
        print("     4. API密钥是否有效\n")
    elif success_count < len(API_KEYS):
        print(f"\n  [WARNING] 部分密钥不可用（{fail_count}/{len(API_KEYS)}），建议更换失败密钥\n")
    else:
        print("\n  [SUCCESS] 所有API密钥均可正常使用！\n")

    return 0 if success_count > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
