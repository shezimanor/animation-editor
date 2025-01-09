import { type UUIDTypes } from 'uuid';

export interface MyNode {
  id: UUIDTypes;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

export const useGlobal = () => {
  console.log('useGlobal');
  // 廣告區域在主畫布的位置(x,y)
  const adModuleX = useState('adModuleX', () => 0);
  const adModuleY = useState('adModuleY', () => 0);

  // 主畫布節點列表(此節點非 Konva 定義的)
  const mainNodeList = useState<MyNode[]>('mainNodeList', () => []);
  // 主畫布節點的 getters
  const mainNodeLength = computed(() => mainNodeList.value.length);
  const mainNodeMap = computed(() =>
    mainNodeList.value.reduce(
      (acc, node) => {
        acc[`${node.id}`] = node;
        return acc;
      },
      {} as Record<string, MyNode>
    )
  );

  const isOpen_createAnimationModal = useState('isOpen_createAnimationModal', () => false);
  const isOpen_createFlashPointModal = useState('isOpen_createFlashPointModal', () => false);

  const currentNodeId = useState<UUIDTypes | null>('currentNodeId', () => null);
  const currentActiveAnimationId = useState<string | null>('currentActiveAnimationId', () => null);
  const currentActiveFlashPointId = useState<string | null>(
    'currentActiveFlashPointId',
    () => null
  );
  return {
    // 廣告區域在主畫布的位置(x,y)
    adModuleX,
    adModuleY,
    // 主畫布節點資訊(此節點非 Konva 定義的)
    mainNodeList, // state
    mainNodeLength, // getter
    mainNodeMap, // getter
    isOpen_createAnimationModal,
    isOpen_createFlashPointModal,
    currentNodeId,
    currentActiveAnimationId,
    currentActiveFlashPointId
  };
};
