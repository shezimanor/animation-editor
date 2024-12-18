interface Tool {
  id: number;
  label: string;
  icon: string;
  feature: string;
  hoverClass: string;
  active: boolean;
  highlight: boolean;
}

export const useTool = () => {
  const currentToolId = useState<number | null>('currentToolId', () => null);
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);
  // 工具按鈕群組
  const tools = computed<Tool[]>(() => [
    {
      id: 1,
      label: '上傳',
      icon: 'mdi:cloud-upload-outline',
      feature: 'upload',
      hoverClass: 'hover:text-blue-400',
      active: true,
      highlight: false
    }
  ]);
  // (可用的)工具按鈕群組(未來可搭配權限)
  const activeTools = computed<Tool[]>(() => tools.value.filter((tool) => tool.active));
  // 工具映射表
  const toolMapping = computed(() => {
    const mapping: Record<string, Tool> = {};
    tools.value.forEach((tool) => {
      mapping[`${tool.id}`] = tool;
    });
    return mapping;
  });
  // 當前工具
  const currentTool = computed(() =>
    currentToolId.value ? toolMapping.value[currentToolId.value] : null
  );

  const openTool = (id: number) => {
    currentToolId.value = id;
  };
  const closeTool = () => {
    currentToolId.value = null;
  };
  const delayCloseTool = () => {
    if (!timer.value)
      timer.value = setTimeout(() => {
        closeTool();
      }, 1000);
  };

  const clearCloseToolTimer = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  };

  return {
    currentTool,
    currentToolId,
    tools,
    activeTools,
    toolMapping,
    openTool,
    closeTool,
    delayCloseTool,
    clearCloseToolTimer
  };
};
