// 왼쪽 예제 탐색 메뉴 컴포넌트
// MUI permanent Drawer + Collapse 기반의 카테고리 expand/collapse 메뉴
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '@repo/playground';
import type { ReactElement } from 'react';
import { useState } from 'react';

/** ExampleNav 컴포넌트 props */
interface ExampleNavProps {
  /** 전체 카테고리 목록 */
  categories: readonly PlaygroundCategory[];
  /** 전체 예제 목록 */
  examples: readonly PlaygroundExample[];
  /** 현재 선택된 예제 ID */
  selectedExampleId: PlaygroundExampleId;
  /** 예제 선택 콜백 */
  onSelectExample: (id: PlaygroundExampleId) => void;
  /** 전체 메뉴 열림 여부 */
  isOpen: boolean;
  /** 현재 Drawer 너비 */
  width: number;
}

/**
 * 왼쪽 예제 탐색 메뉴.
 *
 * 카테고리별로 예제를 그룹핑하며 expand/collapse 가능하다.
 * 초기 확장 상태는 각 카테고리의 `defaultExpanded` 값을 따른다.
 */
export function ExampleNav({
  categories,
  examples,
  selectedExampleId,
  onSelectExample,
  isOpen,
  width,
}: ExampleNavProps): ReactElement {
  // 초기 확장 카테고리 목록: defaultExpanded가 true인 카테고리
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    categories.filter((c) => c.defaultExpanded).map((c) => c.id)
  );

  /** 카테고리 expand/collapse 토글 */
  function handleToggleCategory(categoryId: string): void {
    setExpandedIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  }

  // order 오름차순 정렬
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.sharp,
          }),
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
          overflowX: 'hidden',
          transition: (theme) =>
            theme.transitions.create('width', {
              duration: theme.transitions.duration.shortest,
              easing: theme.transitions.easing.sharp,
            }),
        },
      }}
    >
      {/* 메뉴 헤더 */}
      <List
        id="example-nav"
        aria-hidden={!isOpen}
        subheader={
          <ListSubheader component="div" sx={{ lineHeight: '48px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              canvas-demo
            </Typography>
          </ListSubheader>
        }
        dense
        sx={{
          display: isOpen ? 'block' : 'none',
        }}
      >
        {sortedCategories.map((category) => {
          const isExpanded = expandedIds.includes(category.id);
          // 해당 카테고리에 속하는 예제만 필터
          const categoryExamples = examples.filter((e) => e.categoryId === category.id);

          return (
            <div key={category.id}>
              {/* 카테고리 헤더 행 */}
              <ListItemButton onClick={() => handleToggleCategory(category.id)}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={category.title}
                  slotProps={{
                    primary: { variant: 'body2', sx: { fontWeight: 'medium' } },
                  }}
                />
              </ListItemButton>

              {/* 카테고리 내 예제 목록 */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List dense disablePadding>
                  {categoryExamples.map((example) => (
                    <ListItemButton
                      key={example.id}
                      selected={example.id === selectedExampleId}
                      onClick={() => onSelectExample(example.id)}
                      sx={{ pl: 5 }}
                    >
                      <ListItemText primary={example.title} slotProps={{ primary: { variant: 'body2' } }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
          );
        })}
      </List>
    </Drawer>
  );
}
