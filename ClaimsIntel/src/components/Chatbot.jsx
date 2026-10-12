import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { alpha, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import chatbot from '../assets/Chatbot.png';
import Popper from '@mui/material/Popper';

/* ---------- Pulse animation for FAB ---------- */
const pulseRing = keyframes`
    0% { transform: scale(1); opacity: 0.4; }
    70% { transform: scale(1.35); opacity: 0; }
    100% { transform: scale(1.35); opacity: 0; }
`;

/* ---------- Message entrance animation ---------- */
const messageSlideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export default function Chatbot({ top, bottom, right }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'assistant', text: "Hey there! I'm here to help with questions about the Spanner Graph." }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedModel, setSelectedModel] = useState('Gemini');
    const [reasoningEnabled, setReasoningEnabled] = useState(false);
    
    const [modelMenuOpen, setModelMenuOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [messages, open]);

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setModelMenuOpen(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userText = inputMessage;
        const newMsg = { id: Date.now(), sender: 'user', text: userText };

        setMessages((prev) => [...prev, newMsg]);
        setInputMessage('');

        // Simulated response incorporating selected model and reasoning state
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'assistant',
                    text: `Thanks for asking! [Model: ${selectedModel}, Reasoning: ${reasoningEnabled ? 'ON' : 'OFF'}] You mentioned: "${userText}". How else can I assist you today?`
                }
            ]);
        }, 1000);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                bottom: { bottom },
                right: { right },
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
            }}
        >
            {/* ---------- Chat window panel ---------- */}
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="top-end"
                transition
                disablePortal={false} 
                container={anchorRef.current?.ownerDocument.body}
                sx={{ zIndex: 999999, mb: 2 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: 'bottom right' }}>
                        <Paper
                            elevation={6}
                            sx={(theme) => ({
                                width: 400,
                                maxWidth: 'calc(100vw - 48px)',
                                height: 520,
                                borderRadius: '24px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.6),
                                backgroundColor: theme.palette.background.paper,
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? `0 24px 80px ${alpha('#000', 0.6)}, 0 8px 24px ${alpha('#000', 0.4)}`
                                        : `0 24px 80px ${alpha(theme.palette.primary.main, 0.15)}, 0 8px 24px ${alpha('#000', 0.1)}`,
                            })}
                        >
                            {/* Header */}
                            <Box
                                sx={(theme) => ({
                                    backgroundColor: theme.palette.secondary.main,
                                    color: 'white',
                                    px: 2.5,
                                    pt: 2.5,
                                    pb: 3,
                                })}
                            >
                                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: '#4ade80',
                                                boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)',
                                            }}
                                        />
                                        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                                            Spanner Support
                                        </Typography>
                                    </Stack>
                                    <IconButton
                                        size="small"
                                        onClick={() => setOpen(false)}
                                        sx={{
                                            color: 'inherit',
                                            background: 'rgba(255,255,255,0.12)',
                                            '&:hover': { background: 'rgba(255,255,255,0.22)' },
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {/* Message List Section */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                }}
                            >
                                {messages.map((msg) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                                animation: `${messageSlideIn} 0.3s ease-out both`,
                                            }}
                                        >
                                            <Stack
                                                direction={isUser ? 'row-reverse' : 'row'}
                                                spacing={1.5}
                                                sx={{ maxWidth: '85%', alignItems: 'flex-end' }}
                                            >
                                                {!isUser && (
                                                    <Avatar
                                                        sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}
                                                    >
                                                        AI
                                                    </Avatar>
                                                )}
                                                <Paper
                                                    elevation={0}
                                                    sx={(theme) => ({
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        fontSize: 14,
                                                        bgcolor: isUser
                                                            ? theme.palette.primary.main
                                                            : theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.grey[200], 0.7),
                                                        color: isUser ? theme.palette.primary.contrastText : 'text.primary',
                                                    })}
                                                >
                                                    {msg.text}
                                                </Paper>
                                            </Stack>
                                        </Box>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* ---------- Unified Border Container for Everything ---------- */}
                            <Box
                                component="form"
                                onSubmit={handleSendMessage}
                                sx={(theme) => ({
                                    m: 1.5,
                                    p: 1.5,
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    position: 'relative',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 4px 12px rgba(0,0,0,0.3)'
                                        : '0 4px 12px rgba(0,0,0,0.04)',
                                    '&:focus-within': {
                                        borderColor: theme.palette.primary.main,
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                                            : `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                                    },
                                })}
                            >
                                {/* Text Input Area */}
                                <Box
                                    component="textarea"
                                    placeholder="Type a message..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    sx={(theme) => ({
                                        width: '100%',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        backgroundColor: 'transparent',
                                        fontFamily: 'inherit',
                                        fontSize: '0.9rem',
                                        color: theme.palette.text.primary,
                                        minHeight: '40px',
                                        maxHeight: '100px',
                                        lineHeight: 1.4,
                                        '&::placeholder': {
                                            color: theme.palette.text.secondary,
                                            opacity: 0.7,
                                        },
                                    })}
                                />

                                {/* Bottom Row inside the Unified Border */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5, borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                                    {/* Left Controls (Model Selection & Reasoning) */}
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                        {/* Model Selection Button & Popover Menu */}
                                        <Box sx={{ position: 'relative' }}>
                                            <Button
                                                size="small"
                                                onClick={() => setModelMenuOpen((prev) => !prev)}
                                                startIcon={<AutoAwesomeIcon sx={{ fontSize: '0.9rem !important', color: 'primary.main' }} />}
                                                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                sx={(theme) => ({
                                                    textTransform: 'none',
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    borderRadius: 2,
                                                    py: 0.4,
                                                    px: 1,
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.action.active, 0.08),
                                                    },
                                                })}
                                            >
                                                {selectedModel}
                                            </Button>

                                            {/* Dropdown Menu */}
                                            {modelMenuOpen && (
                                                <ClickAwayListener onClickAway={() => setModelMenuOpen(false)}>
                                                    <Paper
                                                        elevation={6}
                                                        sx={(theme) => ({
                                                            position: 'absolute',
                                                            bottom: '100%',
                                                            left: 0,
                                                            mb: 1,
                                                            py: 0.5,
                                                            minWidth: 140,
                                                            borderRadius: 3,
                                                            zIndex: 10,
                                                            backgroundColor: theme.palette.background.paper,
                                                            boxShadow: theme.palette.mode === 'dark' 
                                                                ? '0 8px 24px rgba(0,0,0,0.6)' 
                                                                : '0 8px 24px rgba(0,0,0,0.15)',
                                                        })}
                                                    >
                                                        <Box
                                                            onClick={() => handleModelSelect('Gemini')}
                                                            sx={(theme) => ({
                                                                px: 2,
                                                                py: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: selectedModel === 'Gemini' ? 600 : 400,
                                                                color: selectedModel === 'Gemini' ? theme.palette.primary.main : 'text.primary',
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                },
                                                            })}
                                                        >
                                                            Gemini
                                                            {selectedModel === 'Gemini' && <CheckIcon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />}
                                                        </Box>
                                                        <Box
                                                            onClick={() => handleModelSelect('MedGemma')}
                                                            sx={(theme) => ({
                                                                px: 2,
                                                                py: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: selectedModel === 'MedGemma' ? 600 : 400,
                                                                color: selectedModel === 'MedGemma' ? theme.palette.primary.main : 'text.primary',
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                },
                                                            })}
                                                        >
                                                            MedGemma
                                                            {selectedModel === 'MedGemma' && <CheckIcon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />}
                                                        </Box>
                                                    </Paper>
                                                </ClickAwayListener>
                                            )}
                                        </Box>

                                        {/* Reasoning Toggle */}
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={reasoningEnabled}
                                                    onChange={(e) => setReasoningEnabled(e.target.checked)}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                    Reasoning
                                                </Typography>
                                            }
                                            sx={{ mr: 0, '& .MuiFormControlLabel-label': { pl: 0.5 } }}
                                        />
                                    </Stack>

                                    {/* Send Button */}
                                    <IconButton
                                        color="primary"
                                        type="submit"
                                        disabled={!inputMessage.trim()}
                                        sx={(theme) => ({
                                            bgcolor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            width: 32,
                                            height: 32,
                                            '&:hover': { bgcolor: theme.palette.primary.dark },
                                            '&.Mui-disabled': { 
                                                bgcolor: theme.palette.action.disabledBackground, 
                                                color: theme.palette.action.disabled 
                                            }
                                        })}
                                    >
                                        <SendIcon sx={{ fontSize: '0.9rem' }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grow>
                )}
            </Popper>

            {/* ---------- Floating Action Button (FAB) with pulse ---------- */}
            <Box ref={anchorRef} sx={{ position: 'relative' }}>
                {!open && (
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            animation: `${pulseRing} 2s ease-out infinite`,
                            pointerEvents: 'none',
                        })}
                    />
                )}
                <Fab
                    color="secondary"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label={open ? 'Close chat' : 'Open chat'}
                    sx={{
                        boxShadow: 4,
                    }}
                >
                    {open ? <CloseIcon /> : <img src={chatbot} style={{
                        width: '70%',
                        height: '70%',
                        objectFit: 'cover'
                    }} alt="Chatbot icon" />}
                </Fab>
            </Box>
        </Box>
    );
}