import os
import json
import re

def process_txt_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dynamic_dir = os.path.join(base_dir, 'dt', 'dynamic')
    data_dir = os.path.join(base_dir, 'dt', 'data')
    os.makedirs(data_dir, exist_ok=True)

    if not os.path.isdir(dynamic_dir):
        print(f"错误：找不到 {dynamic_dir} 文件夹，请先创建它。")
        return

    posts = []
    for filename in os.listdir(dynamic_dir):
        if not filename.endswith('.txt'):
            continue
        # 提取文件名中的数字
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
        date_line = lines[0].strip()          # 第一行日期
        content = '\n'.join(lines[1:])        # 剩余内容
        posts.append({
            'id': num,
            'date': date_line,
            'content': content
        })

    # 按 id 从大到小排序（最新在上）
    posts.sort(key=lambda x: x['id'], reverse=True)

    out_path = os.path.join(data_dir, 'dynamics.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"生成成功！共 {len(posts)} 条动态 -> {out_path}")

if __name__ == '__main__':
    process_txt_files()
