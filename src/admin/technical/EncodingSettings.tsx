// ═══════════════════════════════════════════════════════════════
// 🎬 ENCODING SETTINGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Form, Select, Switch, Button, Space, InputNumber } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Film } from 'lucide-react';

const EncodingSettings: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Encoding Settings:', values);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <Film className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Encoding Settings</h1>
                    <p className="text-gray-500">Configure video encoding parameters</p>
                </div>
            </div>

            <Card title="Video Encoding Configuration">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        codec: 'h264',
                        container: 'mp4',
                        autoEncoding: true,
                        adaptiveBitrate: true,
                        maxBitrate: 8000,
                        audioBitrate: 192,
                    }}
                >
                    <Form.Item label="Video Codec" name="codec">
                        <Select size="large">
                            <Select.Option value="h264">H.264 (AVC)</Select.Option>
                            <Select.Option value="h265">H.265 (HEVC)</Select.Option>
                            <Select.Option value="vp9">VP9</Select.Option>
                            <Select.Option value="av1">AV1</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Container Format" name="container">
                        <Select size="large">
                            <Select.Option value="mp4">MP4</Select.Option>
                            <Select.Option value="mkv">MKV</Select.Option>
                            <Select.Option value="webm">WebM</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Output Resolutions" name="resolutions">
                        <Select mode="multiple" size="large" placeholder="Select resolutions">
                            <Select.Option value="360p">360p (SD)</Select.Option>
                            <Select.Option value="480p">480p (SD)</Select.Option>
                            <Select.Option value="720p">720p (HD)</Select.Option>
                            <Select.Option value="1080p">1080p (Full HD)</Select.Option>
                            <Select.Option value="1440p">1440p (2K)</Select.Option>
                            <Select.Option value="2160p">2160p (4K)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Max Video Bitrate (kbps)" name="maxBitrate">
                        <InputNumber size="large" style={{ width: '100%' }} min={1000} max={20000} step={500} />
                    </Form.Item>

                    <Form.Item label="Audio Bitrate (kbps)" name="audioBitrate">
                        <InputNumber size="large" style={{ width: '100%' }} min={64} max={320} step={32} />
                    </Form.Item>

                    <Form.Item label="Audio Codec" name="audioCodec">
                        <Select size="large">
                            <Select.Option value="aac">AAC</Select.Option>
                            <Select.Option value="mp3">MP3</Select.Option>
                            <Select.Option value="opus">Opus</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Auto-Encoding" name="autoEncoding" valuePropName="checked">
                        <Switch />
                        <span className="ml-2 text-sm text-gray-500">
                            Automatically encode uploaded videos
                        </span>
                    </Form.Item>

                    <Form.Item label="Adaptive Bitrate Streaming (HLS)" name="adaptiveBitrate" valuePropName="checked">
                        <Switch />
                        <span className="ml-2 text-sm text-gray-500">
                            Generate multiple quality variants
                        </span>
                    </Form.Item>

                    <Form.Item label="Generate Thumbnails" name="thumbnails" valuePropName="checked">
                        <Switch defaultChecked />
                        <span className="ml-2 text-sm text-gray-500">
                            Auto-generate video thumbnails
                        </span>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                                Save Settings
                            </Button>
                            <Button size="large">Test Encoding</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EncodingSettings;
