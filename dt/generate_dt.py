import os
import json
import re

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dynamic_dir = os.path.join(base_dir, 'dt', 'dynamic')
    data_dir = os.path.join(base_dir, 'dt', 'data')
    os.makedirs(data_dir, exist_ok=True)

    if not os.path.isdir(dynamic_dir):
        print(f"警告：{dynamic_dir} 不存在，跳过生成。")
        return

    posts = []
    for filename in os.listdir(dynamic_dir):
        if not filename.endswith('.txt'):
            continue
        match = re.search(r'\d+', filename)
        if not match:
            print(f"跳过 {filename}：文件名不含数字")
            continue
        num = int(match.group())
        filepath = os.path.join(dynamic_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
        if not lines:
            continue
        date_line = lines[0].strip()
        content = '\n'.join(lines[1:])
        posts.append({
            'id': num,
            'date': date_line,
            'content': content
        })

    posts.sort(key=lambda x: x['id'], reverse=True)

    out_path = os.path.join(data_dir, 'dynamics.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"生成成功！共 {len(posts)} 条动态 -> {out_path}")

if __name__ == '__main__':
    main()
