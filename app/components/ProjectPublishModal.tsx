import * as React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
// @ts-ignore  // 这个不怨我
import Tags from '@yaireo/tagify/react';
import AutoCloseAlert from '@/components/AutoCloseAlert';

import type { PublishWorkInfo } from '@/interfaces/work';
import '@yaireo/tagify/dist/tagify.css';
import './ProjectPublishModal.scss';

const ProjectPublishModal = ({
    workInfo,
    isShow,
    setIsShow,
}: {
    workInfo: PublishWorkInfo;
    isShow: boolean;
    setIsShow: (show: boolean) => void;
}) => {
    const [alerts, setAlerts] = React.useState<React.JSX.Element[]>([]);
    const [work, setWork] = React.useState<PublishWorkInfo>(workInfo);

    let lang = workInfo.lang;
    if (lang === 'webpy' || lang === 'python') {
        lang = 'python';
    } else if (lang === 'cpp') {
        lang = 'compilers';
    } else {
        lang = 'projects';
    }

    const onClickPublish = async () => {
        // @ts-ignore
        if (workNameRef.current.value === '' || workTagsRef.current === '') {
            setAlerts([<AutoCloseAlert severity="warning">有选项未填写！</AutoCloseAlert>, ...alerts]);
            return;
        }
        await fetch(`/api/${lang}/${work.id}/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: work.id,
                // @ts-ignore
                name: workNameRef.current.value,
                // @ts-ignore
                tags: workTagsRef.current.trimEnd(),
                created_source: origin,
                thumbnail: thumbnailImage,
                hidden_code: 2,
                // @ts-ignore
                description: descriptionTextRef.current.value,
            }),
        });
        setIsShow(false);
        setAlerts([<AutoCloseAlert severity="success">已发布</AutoCloseAlert>, ...alerts]);
    };

    // 提交内容
    const workNameRef = React.useRef<HTMLInputElement>(null);
    const workTagsRef = React.useRef<string>(null);
    // const thumbnailImageRef = React.useRef<HTMLImageElement>(null);
    const [thumbnailImage, setThumbnailImage] = React.useState<string>(
        work.thumbnail || 'https://static0.xesimg.com/talcode/assets/py/default-python-thumbnail.png',
    );
    const descriptionTextRef = React.useRef<HTMLTextAreaElement>(null);
    const [origin, setOrigin] = React.useState<string>(work.created_source || 'original');

    const handleChangeOrigin = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin(e.target.value);
    };

    React.useEffect(() => {
        let ignore = false;
        const func = async () => {
            let now_lang = lang;
            if (lang === 'python') now_lang = 'compilers';
            const response = await fetch(`/api/${now_lang}/${work.id}?id=${work.id}`);
            const responseData = await response.json();
            setWork(responseData.data);
        };

        if (!ignore) func();
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <Modal show={isShow} centered={true} dialogClassName="publish-modal" contentClassName="publish-modal-content">
            <Modal.Header>
                <Modal.Title>发布作品</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="alert-list">{alerts}</div>
                <Row>
                    <Col sm={6}>
                        <p>作品封面</p>
                        <img src={thumbnailImage} alt="作品封面" style={{ width: '100%' }} />
                    </Col>
                    <Col sm={6}>
                        <Form.Label>* 作品名称</Form.Label>
                        <Form.Control
                            ref={workNameRef}
                            type="text"
                            placeholder="请输入作品名称"
                            defaultValue={work.name}
                        />

                        <Form.Label>* 作品来源</Form.Label>
                        <Form.Group>
                            <Form.Check
                                checked={origin === 'original'}
                                inline
                                onChange={handleChangeOrigin}
                                type="radio"
                                label="原创"
                                name="origin"
                                value="original"
                                disabled={work.created_source === 'adapt'}
                            />
                            <Form.Check
                                checked={origin === 'adapt'}
                                inline
                                onChange={handleChangeOrigin}
                                type="radio"
                                label="改编"
                                name="origin"
                                value="adapt"
                                disabled={work.created_source !== 'adapt'}
                            />
                            <Form.Check
                                checked={origin === 'reprint'}
                                inline
                                onChange={handleChangeOrigin}
                                type="radio"
                                label="转载"
                                name="origin"
                                value="reprint"
                                disabled={work.created_source === 'adapt'}
                            />
                        </Form.Group>

                        <Form.Label>*作品标签（空格分开两个标签）</Form.Label>
                        <Tags
                            whitelist={['游戏', '动画', '故事', '模拟', '艺术', '教程', '其他']}
                            placeholder="添加标签"
                            settings={{
                                dropdown: {
                                    enabled: 0,
                                },
                            }}
                            onChange={(event: any) => {
                                const tags: { value: string }[] = event.detail.tagify.getCleanValue();
                                let tag_str = '';
                                tags.forEach(tag => {
                                    tag_str += tag.value.replaceAll(' ', '&nbsp;') + ' ';
                                });
                                console.log(tag_str);
                                workTagsRef.current = tag_str;
                            }}
                            className=""
                        />

                        <Form.Label>作品介绍</Form.Label>
                        <Form.Control
                            ref={descriptionTextRef}
                            as="textarea"
                            cols={5}
                            rows={3}
                            placeholder="请输入作品介绍"
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => setIsShow(false)}>
                    返回
                </Button>
                <Button variant="primary" onClick={() => onClickPublish()}>
                    确定发布
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProjectPublishModal;
