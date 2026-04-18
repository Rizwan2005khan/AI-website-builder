import prisma from "../lib/prisma.js";
import { Request, Response } from "express";
import { createChatCompletion } from "../lib/ai.js";

// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'unauthorized'})
        }
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        res.json({credits: user?.credits})
    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({message: error.message})
    }
}

//controller Function to create new project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;

    // --- Phase 1: validate, create project record, send response ---
    let projectId: string;
    try {
        const {initial_prompt} = req.body;
        if(!userId){
            return res.status(401).json({message: 'Unauthorized'})
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(user && user.credits < 1){
            return res.status(403).json({message: 'add credits to create more projects'})
        }

        //create a new project
        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 
                ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                initial_prompt,
                userId
            }
        })
        projectId = project.id;

        //update user's total creation
        await prisma.user.update({
            where: {id: userId},
            data: {totalCreation: {increment: 1}}
        })

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        })

        await prisma.user.update({
            where: {id: userId},
            data: {credits: {decrement: 1}}
        })

        // Send the response BEFORE the long AI work starts
        res.json({projectId: project.id})

    } catch (error: any) {
        console.log(error.code || error.message)
        // Only send error response if headers haven't been sent yet
        if (!res.headersSent) {
            return res.status(500).json({message: error.message})
        }
        return;
    }

    // --- Phase 2: AI generation (runs after response is sent) ---
    // Any errors here are logged only — we cannot send another HTTP response.
    const {initial_prompt} = req.body;
    try {
        // enhance user prompt
        const promptEnhanceResponse = await createChatCompletion([
                {
                    role: 'system',
                    content: `
                    You are a prompt enhancement specialist for a high-end AI Site Builder. 
                    Your goal is to take a core idea and expand it into a detailed technical specification for a Single-Page Application (SPA).

                    If the user asks for complex features (e-commerce, carts, login flows, content management):
                    1. DO NOT REFUSE. Everything can be implemented or simulated with high fidelity in a single file.
                    2. Specify that the site should use 'LocalStorage' for data persistence (like a shopping cart that stays after refresh).
                    3. Detail the specific components needed (e.g., "A slide-over shopping cart", "A multi-step checkout modal", "A filterable product grid").
                    4. Outline the primary interactions and animations that will make the site feel like a premium dynamic application.
                    5. Include modern design tokens (color palette, typography, spacing).

                    Return ONLY the enhanced prompt. Make it professional, technical, and detailed.
                    `
                },
                {
                    role: 'user',
                    content: initial_prompt
                }
            ])

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}" `,
                projectId
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'now generating your website...',
                projectId
            }
        })

        // Generate website code
        const codeGenerationResponse = await createChatCompletion([
                {
                    role: 'system',
                    content: `
                    You are a world-class Application Prototype Specialist. You create high-fidelity, production-ready Single-File Applications (SFAs) that feel like full-stack sites.

                    CORE PRINCIPLES:
                    1. NO REFUSALS: You must implement ANY requested feature (e-commerce, carts, dashboards, login flows) using sophisticated frontend logic.
                    2. PERSISTENCE: Use 'localStorage' to ensure user data (like cart items, profile info) persists across page reloads.
                    3. MOCK BACKEND: If external data is needed, create a robust mock dataset in your JavaScript.
                    4. INTERACTIVITY: Use advanced Vanilla JS or state management to manage UI transitions and complex flows.

                    CRITICAL REQUIREMENTS:
                    - You MUST output valid HTML ONLY. 
                    - Use Tailwind CSS v4 for ALL styling: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                    - Use Tailwind utility classes extensively for styling, animations, and responsiveness.
                    - Modern, premium design with micro-interactions and smooth transitions.
                    - Fully responsive (sm:, md:, lg:, xl:).
                    - Use https://placehold.co/600x400 for images.
                    - Use Lucide Icons (via CDN: <script src="https://unpkg.com/lucide@latest"></script>) for professional iconography.

                    CRITICAL HARD RULES:
                    1. You MUST put ALL output ONLY into message.content.
                    2. You MUST NOT include internal thoughts, explanations, markdown, or code fences.
                    3. YOU MUST NOT SAY "I CANNOT IMPLEMENT THIS." Do not mention backend/database limitations. Solve them with frontend engineering.

                    The HTML should be complete and ready to render beautifully immediately.
                    `
                },
                {
                    role: 'user',
                    content: enhancedPrompt || ''
                }
            ])

        const code = codeGenerationResponse.choices[0].message.content || '';

        if(!code){
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code, please try again",
                    projectId
                }
            })
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {increment: 1}}
            })
            return;
        }

        //create version for the project
        const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                description: 'Initial version',
                projectId
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've created your website! You can now preview it and request any changes.",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                current_version_index: version.id
            }
        })
    } catch (error: any) {
        // Post-response error: refund credit and log — cannot send HTTP response
        console.error(
            '[createUserProject] AI generation failed:',
            error?.status || error?.code || error?.message,
            error?.error?.message || ''
        )
        try {
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {increment: 1}}
            })
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Website generation failed. Your credit has been refunded. Please try again.",
                    projectId
                }
            })
        } catch (refundErr: any) {
            console.error('[createUserProject] Credit refund failed:', refundErr.message)
        }
    }
}

// Controller Function to Get A Single User Project
export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'unauthorized'})
        }

        const {projectId: projectid} = req.params

        const project = await prisma.websiteProject.findFirst({
            where: {id: projectid, userId},
            include: {
                conversation: {
                    orderBy: {timestamp: 'asc'}
                },
                versions: {orderBy: {timestamp: 'asc'}}
            }
        })
        if(!project){
            return res.status(404).json({message: 'Project not found'})
        }

        res.json({project})
    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({message: error.message})
    }
}

// controller function to Get All Users Projects
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'unauthorized'})
        }

        const projects = await prisma.websiteProject.findMany({
            where: {userId},
            orderBy: {updatedAt: 'desc'}
        })

        res.json({projects})
    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({message: error.message})
    }
}

// controller function to toggle project publish
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: 'unauthorized'})
        }

        const {projectId} = req.params;

        const project = await prisma.websiteProject.findFirst({
            where: {id: projectId, userId}
        })
        if(!project){
            return res.status(404).json({message: 'Project not found'})
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {isPublished: !project.isPublished}
        })

        res.json({message: project.isPublished ? 'Project Unpublished' : 'Project Published Successfully'})
    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({message: error.message})
    }
}

//controller function to purchase credits
export const purchaseCredits = async (req: Request, res: Response) => {
    
}
